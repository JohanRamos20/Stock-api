# Materiais — rotas e integração com Solicitações (Request)

## Rotas `/materials`

Todas exigem `Authorization: Bearer <token>` (`authMiddleware`). `create`/`edit`/`delete`
exigem role `ADMIN`; `getAll` é aberto a qualquer usuário autenticado.

| Método | Rota             | Role  | Descrição |
|--------|------------------|-------|-----------|
| POST   | `/materials`     | ADMIN | Cadastra um material |
| GET    | `/materials`     | any   | Lista todos os materiais (sem paginação) |
| PATCH  | `/materials/:id` | ADMIN | Edita um material |
| DELETE | `/materials/:id` | ADMIN | Remove um material |

### POST /materials

Body:
```json
{
  "name": "string (obrigatório)",
  "category": "FERRAMENTA | EPI | CONSUMIVEL",
  "location": "string (obrigatório)",
  "amount": "number (inteiro, >= 0)",
  "unitType": "UNITY | BOX"
}
```
201 → retorna o material criado (`id`, `name`, `category`, `location`, `amount`, `unitType`, `createdAt`, `updatedAt`).

### GET /materials

200 → array de materiais, mesmo formato do item acima, ordenado por `createdAt desc`.

### PATCH /materials/:id

Body: todos os campos do create, porém **opcionais** (pelo menos um precisa vir preenchido).
Inclui `amount`, permitindo correção manual de estoque (contagem física, entrada de mercadoria).

- 200 → material atualizado.
- 404 → `Material not found: {id}`.
- 400 → nenhum campo enviado, ou campo inválido (enum errado, `amount` negativo, etc).

### DELETE /materials/:id

Hard delete. Antes de apagar, checa se o material está referenciado em alguma
`RequestMaterial` (ou seja, se já foi usado em alguma solicitação).

- 204 → removido.
- 404 → `Material not found: {id}`.
- 409 → `Material is in use and cannot be deleted` (existe ao menos uma solicitação com esse material).

## Materiais dentro das rotas `/requests`

As solicitações (`Request`) carregam uma lista de materiais (`RequestMaterial`,
`materialId` + `quantity`). Esses campos aparecem em três pontos do fluxo de `/requests`:

### Payload de criação/edição

`POST /requests` e `PATCH /requests/:id` recebem `materials` como um array:
```json
{
  "materials": [
    { "materialId": "uuid", "quantity": 4 }
  ]
}
```
- `materialId`: uuid de um material existente (senão → 404 `Material not found: {id}`).
- `quantity`: inteiro positivo.
- `materials` precisa ter pelo menos 1 item quando enviado (`min(1)`).
- Em `PATCH`, `materials` é opcional — quando enviado, **substitui a lista inteira** de
  materiais da solicitação (não é um merge).

### Resposta (`GET`/`POST`/`PATCH` de `/requests`)

Cada item de `materials` na resposta vem "hidratado" com os dados do material no momento
da consulta:
```json
{
  "materials": [
    {
      "materialId": "uuid",
      "name": "string",
      "category": "FERRAMENTA | EPI | CONSUMIVEL",
      "unitType": "UNITY | BOX",
      "quantity": 4
    }
  ]
}
```

### Efeito no estoque (`Material.amount`)

Cada ação em `/requests` que envolve `materials` reflete no `amount` do material
correspondente, via `IMaterialRepository.decrementAmount`/`incrementAmount`
(nunca escrito diretamente pelo repositório de `Request`):

| Ação | Efeito no estoque |
|---|---|
| `POST /requests` (create) | Decrementa `amount` de cada material pela `quantity` pedida — reserva o estoque na hora da criação. Se algum material não tiver saldo suficiente, a criação inteira falha (409) e nada é decrementado. |
| `PATCH /requests/:id` com `materials` (edit) | Devolve (`incrementAmount`) as quantidades da lista antiga e decrementa (`decrementAmount`) as quantidades da lista nova, na mesma transação. Se a nova lista pedir mais do que o saldo permite (já considerando a devolução), falha com 409 e nada muda. Editar só `prazo` não mexe em estoque. |
| `DELETE /requests/:id` (cancel) | Devolve (`incrementAmount`) a `quantity` de cada material da solicitação. |
| `PATCH /requests/:id/complete` (complete) | **Não mexe em estoque** — o estoque já foi reservado no create/edit; completar só transiciona o `status` para `COMPLETED`. |

Erro relevante: `Insufficient stock for material {id}: requested {quantity}, available {amount}`
(409), lançado pelo guard atômico de `decrementAmount` (um `UPDATE ... WHERE amount >= quantity`
condicional) — nunca por uma checagem manual no usecase, o que evita condição de corrida
entre validar e decrementar.
