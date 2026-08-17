# Fluxo de Solicitação (Request)

Implementação completa do fluxo de solicitações de materiais, seguindo a arquitetura em
camadas já usada na feature `user` (`domain` → `application` → `infrastructure` →
`database`/`main`). Nomeada `Request` em todo o código (classes, arquivos, rotas) para
ficar consistente com o model `Request` do Prisma/banco.

## Regras de negócio

- **Create**: recebe `materials` (`materialId` + `quantity`) no mesmo payload; `Request` +
  `RequestMaterial` são criados numa escrita atômica (nested write do Prisma).
- **Prazo padrão**: campo `prazo` é opcional no create. Se omitido, assume **1 dia útil**
  a partir do momento da criação (pula sábado/domingo, sem calendário de feriados).
- **Cancel** (era chamado "delete"): soft-delete — muda `status` para `CANCELED`, não
  remove a linha. Só é permitido enquanto a solicitação está `PENDING`.
- **Edit**: só permitido enquanto `PENDING`; pode alterar `prazo` e/ou substituir a lista
  de `materials` inteira.
- **Complete**: dá baixa em `Material.amount` (decrementa estoque) e só então marca
  `status = COMPLETED`, dentro de uma transação Prisma (`$transaction`). Valida estoque
  suficiente antes de decrementar.
- **Autorização**: usuário autenticado cria/vê/edita/cancela as próprias solicitações
  (dono ou ADMIN). `completeRequest` e a listagem geral (`/requests/all`) exigem role
  `ADMIN`.
- **Paginação**: `GET /requests/me` e `GET /requests/all` aceitam `?page=&limit=`
  (default `page=1`, `limit=10`), retornando `{ data, total, page, totalPages }`.

## Rotas

| Método | Rota                     | Middleware                             | Descrição                     |
|--------|--------------------------|------------------------------------------|--------------------------------|
| POST   | `/requests`               | `authMiddleware`                        | Cria solicitação               |
| GET    | `/requests/me`            | `authMiddleware`                        | Lista as próprias (paginado)   |
| GET    | `/requests/all`           | `authMiddleware`, `requireRole(ADMIN)`  | Lista todas (paginado)         |
| GET    | `/requests/:id`           | `authMiddleware`                        | Busca por id (dono ou ADMIN)   |
| PATCH  | `/requests/:id`           | `authMiddleware`                        | Edita (dono ou ADMIN)          |
| DELETE | `/requests/:id`           | `authMiddleware`                        | Cancela (dono ou ADMIN)        |
| PATCH  | `/requests/:id/complete`  | `authMiddleware`, `requireRole(ADMIN)`  | Completa e baixa estoque       |

`/me` e `/all` são registradas antes de `/:id` para não colidir com o parâmetro de rota.

## Catálogo de erros (`BusinessError`)

Nenhuma classe nova de erro foi criada — segue a convenção existente do projeto de lançar
`BusinessError(message, statusCode)` no ponto de falha, sem subclasses por categoria.

| Situação                                              | Status | Mensagem |
|--------------------------------------------------------|--------|----------|
| Material informado não existe                          | 404    | `Material not found: {id}` |
| Solicitação não existe                                  | 404    | `Request not found: {id}` |
| Usuário não é dono nem ADMIN                            | 403    | `You do not have permission to access this request` |
| Role insuficiente na rota (complete / listAll)          | 403    | `Forbidden: insufficient permissions` |
| Editar/cancelar solicitação que não está PENDING        | 409    | `Request is already {status} and cannot be modified/canceled` |
| Completar solicitação que não está PENDING              | 409    | `Request is already {status}` |
| Estoque insuficiente ao completar                       | 409    | `Insufficient stock for material {id}: requested {quantity}, available {amount}` |
| Payload/query inválido (materials vazio, uuid inválido, page/limit inválidos, etc.) | 400 | tratado pelo `ZodError` no `errorMiddleware` |

## Arquivos criados

**Domain**
- `src/domain/entities/request.entity.ts` — `Request`, `RequestStatus`, `RequestMaterialProps`
- `src/domain/entities/material.entity.ts` — `Material`, `MaterialCategory`, `UnitType`
- `src/domain/repositories/request.repository.ts` — `IRequestRepository`
- `src/domain/repositories/material.repository.ts` — `IMaterialRepository`

**Database**
- `src/database/mappers/request.mapper.ts` / `material.mapper.ts`
- `src/database/repositories/prisma-request.repository.ts` / `prisma-material.repository.ts`

**Application**
- `src/application/dtos/request/request-response.dto.ts`
- `src/application/usecases/request/`
  - `create-request.usecase.ts`
  - `edit-request.usecase.ts`
  - `cancel-request.usecase.ts`
  - `get-request.usecase.ts`
  - `get-request-user.usecase.ts`
  - `get-request-all.usecase.ts`
  - `complete-request.usecase.ts`

**Infrastructure**
- `src/infrastructure/validators/request.validator.ts`
- `src/infrastructure/http/controllers/request.controller.ts`
- `src/infrastructure/http/middlewares/require-role.middleware.ts`
- `src/infrastructure/factories/request.factory.ts`
- `src/infrastructure/http/routes/request.routes.ts`

## Arquivos modificados

O middleware de autenticação passou a carregar a `role` do usuário no JWT, necessário para
as checagens de ADMIN sem precisar consultar o banco a cada requisição:

- `src/domain/services/token.service.ts` — `TokenPayload` ganhou `role: UserRole`
- `src/application/usecases/user/login.usecase.ts` — assina o token com `role`
- `src/infrastructure/http/middlewares/auth.middleware.ts` — decodifica `role`, popula `req.userRole`
- `src/infrastructure/http/types/express.d.ts` — adiciona `userRole?: UserRole` ao `Request`
- `src/main/config/app.ts` — monta `app.use("/requests", requestRoutes)`

## Verificação realizada

- `npm run typecheck` e `npm run build` passam sem erros.
- Teste manual ponta a ponta via `npm run dev` + curl na rota `/requests`: create (com
  prazo default de 1 dia útil), get por id, listagem própria e geral (com bloqueio 403
  para não-ADMIN em `/all`), edit, cancel (com 409 ao cancelar de novo), complete (com
  baixa real de estoque, bloqueio 403 para não-ADMIN, 409 ao completar de novo, 409 por
  estoque insuficiente) e 404 para material inexistente — todos os cenários do catálogo
  de erros se comportaram como esperado.
