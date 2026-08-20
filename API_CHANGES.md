# Mudanças de API para o front-end

Resumo das mudanças de comportamento da API feitas recentemente (PRs #9, #10, #11, #12), com o que precisa de ajuste no front-end.

---

## 1. `GET /materials` — materiais sem estoque somem para usuário comum

**PR #9**

- Sem mudança nos parâmetros da requisição.
- **Mudança de comportamento:** usuários com role `USER` deixam de receber, na resposta, materiais com `amount === 0`. Usuários `ADMIN` continuam vendo todos os materiais, inclusive os zerados.
- Formato de cada item da resposta continua o mesmo:
```json
{
  "id": "string",
  "name": "string",
  "category": "FERRAMENTA | EPI | CONSUMIVEL",
  "location": "string",
  "amount": 0,
  "unitType": "UNITY | BOX",
  "createdAt": "2026-08-19T00:00:00.000Z",
  "updatedAt": "2026-08-19T00:00:00.000Z"
}
```

**Ajuste no front:** se a tela de usuário comum tinha alguma lógica local para esconder/desabilitar materiais com `amount === 0` (ex.: desabilitar botão de solicitar), isso já não é mais necessário para esse perfil — o item simplesmente não vem mais na lista. Para admin, nada muda.

---

## 2. Senha: troca (self-service) separada de reset (admin)

**PR #10**

Antes existia só `POST /users/password/reset`, usada pelo próprio usuário para trocar a senha. Agora existem duas rotas distintas:

### 2.1 `POST /users/password/reset` — sem mudança de contrato
Continua igual ao que já existia: o próprio usuário troca a própria senha informando a senha atual. Não requer token de autenticação.

```json
// Request body
{
  "email": "user@example.com",
  "currentPassword": "senha-atual",
  "newPassword": "nova-senha-com-8-chars-no-minimo",
  "confirmNewPassword": "nova-senha-com-8-chars-no-minimo"
}
```
- `204 No Content` em caso de sucesso.
- `401 Invalid credentials` se `email`/`currentPassword` não conferem.

**Ajuste no front:** nenhum — nada muda nessa tela.

### 2.2 `PATCH /users/:id/password/reset` — **nova rota, admin-only**
Permite que um admin force a senha de outro usuário a voltar a ser o SIAPP dele (a mesma senha padrão usada na criação da conta). Não recebe body.

- Requer header `Authorization: Bearer <token>` de um usuário `ADMIN`.
- `204 No Content` em caso de sucesso.
- `401` sem token / token inválido.
- `403` se quem chama não é admin.
- `404` se `:id` não existe.

**Ajuste no front:** se houver (ou for planejada) uma tela de gestão de usuários para admin, adicionar uma ação "resetar senha" que chama `PATCH /users/{id}/password/reset` sem body — o usuário afetado passa a logar novamente usando o SIAPP como senha.

---

## 3. `DELETE /users/:id` — nova rota, admin exclui usuário

**PR #11**

- Admin-only. Exige a **senha do próprio admin logado** no body, como confirmação (não a senha do usuário que será excluído).
```json
// Request body
{
  "password": "senha-do-admin-logado"
}
```
- `204 No Content` em caso de sucesso (exclusão definitiva, sem soft delete).
- `401` sem token, token inválido, ou senha do admin incorreta (`Invalid credentials`).
- `403` se o admin tentar excluir a própria conta (`Admins cannot delete their own account`) ou se quem chama não é admin.
- `404` se `:id` não existe.
- `409` se o usuário alvo tiver solicitações (`Request`) associadas — a exclusão é bloqueada nesse caso (`User has associated requests and cannot be deleted`).

**Ajuste no front:** ao implementar a ação de excluir usuário na tela de admin, o formulário/modal de confirmação precisa pedir a **senha do admin logado** (não apenas um "tem certeza?"), e tratar o 409 com uma mensagem específica ("este usuário possui solicitações e não pode ser excluído").

## 3.1 `GET /users` — agora só retorna usuários com role `USER`

Também no PR #11 (ajuste feito pelo próprio time): a listagem de usuários deixou de incluir contas com role `ADMIN`.

**Ajuste no front:** se alguma tela usava `GET /users` para listar/selecionar admins (ex.: um seletor de "atribuir a outro admin"), essa rota não serve mais para isso — não há hoje um endpoint alternativo para listar admins.

---

## 4. `PATCH /requests/:id/complete` — resposta ganha os campos `adminId` e `adminName`

**PR #12**

- Sem mudança nos parâmetros da requisição (continua sem body).
- A resposta (e qualquer outro endpoint que retorne uma `Request`, como `GET /requests/:id`, `GET /requests/me`, `GET /requests/all`) agora inclui dois novos campos:
```json
{
  "id": "string",
  "userId": "string",
  "adminId": "string | null",
  "adminName": "string | null",
  "prazo": "2026-08-20T00:00:00.000Z",
  "status": "PENDING | SEPARATED | COMPLETED | CANCELED",
  "materials": [ ... ],
  "createdAt": "2026-08-19T00:00:00.000Z",
  "updatedAt": "2026-08-19T00:00:00.000Z"
}
```
- **Antes:** só existia `adminId`, e para exibir "concluído por: Fulano" o front precisava de uma segunda chamada (`GET /users/:id`, admin-only) para resolver o nome a partir do id.
- **Depois:** `adminId` e `adminName` são preenchidos juntos, no momento em que a solicitação é concluída via `PATCH /requests/:id/complete`. `adminName` é o nome do admin autenticado naquele instante, calculado pelo servidor — não é enviado pelo front e não pode ser editado depois. Antes de a solicitação ser concluída, ambos ficam `null`.
- **Exclusão do admin depois de concluir uma solicitação (`DELETE /users/:id`):** `adminId` volta a `null` (a referência ao usuário deixa de existir), mas **`adminName` permanece com o nome histórico**, imutável. Ou seja, a informação "quem concluiu" não se perde mais quando o admin é excluído.

**Ajuste no front:** para exibir "concluído por: Fulano" nas telas de solicitação, usar diretamente o campo `adminName` da resposta — não é mais necessário nenhum lookup adicional em `GET /users/:id`, mesmo que o admin responsável já tenha sido excluído. O campo `adminId` continua disponível (útil, por exemplo, para linkar para o perfil do admin quando ele ainda existir), mas não deve mais ser a fonte usada para exibir o nome.

**Exemplo de payload antes/depois:**
```json
// Antes (PR anterior)
{ "adminId": "3f2a1e10-...", "status": "COMPLETED" }

// Depois (esta mudança)
{ "adminId": "3f2a1e10-...", "adminName": "Maria Souza", "status": "COMPLETED" }

// Depois de o admin "Maria Souza" ser excluído (DELETE /users/:id)
{ "adminId": null, "adminName": "Maria Souza", "status": "COMPLETED" }
```

---

## 5. Novo status `SEPARATED` no fluxo de solicitação

**PR #13**

O ciclo de vida de uma `Request` deixa de ser `PENDING -> COMPLETED` (ou `PENDING -> CANCELED`) e passa a ter uma etapa intermediária:

```
PENDING -> SEPARATED -> COMPLETED
   \____________\____________/
         (cancelável até aqui)
```

### 5.1 `PATCH /requests/:id/separate` — **nova rota, admin-only**
Marca que os materiais da solicitação já foram fisicamente separados. Não recebe body.

- Requer header `Authorization: Bearer <token>` de um usuário `ADMIN`.
- `200 OK` com a `Request` atualizada (mesmo formato de `PATCH /requests/:id/complete`, com `status: "SEPARATED"`).
- `401` sem token / token inválido.
- `403` se quem chama não é admin.
- `404` se `:id` não existe.
- `409` se a solicitação não estiver em `PENDING` (ex.: já `SEPARATED`, `COMPLETED` ou `CANCELED`) — corpo do erro traz a mensagem `Request is already {status} and cannot be separated`.

**Ajuste no front:** na tela de gestão de solicitações do admin, adicionar uma ação "separar materiais" (`PATCH /requests/{id}/separate`) disponível apenas quando `status === "PENDING"`. Depois de chamada, o card/linha da solicitação deve refletir `status: "SEPARATED"`.

### 5.2 `PATCH /requests/:id/complete` — pré-condição mudou
**Antes:** exigia `status === "PENDING"`.
**Depois:** exige `status === "SEPARATED"`. Chamar `complete` numa solicitação ainda `PENDING` agora retorna `409` (`Request must be SEPARATED to be completed (current status: PENDING)`).

**Ajuste no front:** o botão/ação "concluir solicitação" só deve ficar habilitado quando `status === "SEPARATED"` (antes bastava `PENDING`). Se a tela hoje mostra essa ação assim que a solicitação é criada, ela precisa esperar a etapa de separação primeiro.

### 5.3 `DELETE /requests/:id` (cancelar) — passa a aceitar `SEPARATED` também
**Antes:** só cancelava solicitações `PENDING`.
**Depois:** cancela solicitações em `PENDING` **ou** `SEPARATED` (por usuário dono ou admin, sem mudança nessa regra de permissão). Continua bloqueado (`409`) para `COMPLETED`/`CANCELED`.

**Ajuste no front:** o botão "cancelar solicitação" deve continuar aparecendo (para dono ou admin) enquanto `status` for `PENDING` ou `SEPARATED`, não só em `PENDING` como hoje. O estoque dos materiais é restaurado automaticamente pelo servidor em ambos os casos, sem ação extra do front.

### 5.4 `GET /requests/:id/withdrawal-slip` — pré-condição mudou
**Antes:** liberado em qualquer status, exceto `CANCELED`.
**Depois:** só liberado quando `status` for `SEPARATED` ou `COMPLETED`. Antes disso, retorna `409` (`Withdrawal slip can only be issued once the request has been separated`).

**Ajuste no front:** o link/botão "emitir guia de retirada" deve só aparecer (ou só ficar habilitado) quando `status` for `SEPARATED` ou `COMPLETED` — em `PENDING`, a chamada agora falha com 409.

---

## Resumo rápido de rotas novas/alteradas

| Método | Rota | O que mudou |
|---|---|---|
| GET | `/materials` | Usuário comum não vê mais itens com `amount === 0` |
| POST | `/users/password/reset` | Sem mudança (troca de senha self-service) |
| PATCH | `/users/:id/password/reset` | **Nova** — admin reseta senha de outro usuário para o SIAPP |
| DELETE | `/users/:id` | **Nova** — admin exclui usuário, exige senha do próprio admin no body |
| GET | `/users` | Não retorna mais usuários `ADMIN`, só `USER` |
| PATCH | `/requests/:id/complete` | Resposta ganha campos `adminId` e `adminName` (nome sobrevive à exclusão do admin); agora exige `status === "SEPARATED"` |
| PATCH | `/requests/:id/separate` | **Nova** — admin marca materiais como separados (`PENDING -> SEPARATED`) |
| DELETE | `/requests/:id` | Cancelamento agora aceito em `PENDING` ou `SEPARATED` (antes só `PENDING`) |
| GET | `/requests/:id/withdrawal-slip` | Agora exige `status` `SEPARATED` ou `COMPLETED` (antes liberado em qualquer status exceto `CANCELED`) |
