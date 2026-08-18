# Plano: gerar o PDF do termo de retirada no frontend (Stock-web)

## Contexto

O backend (`Stock-api`) deixou de renderizar o PDF do "Termo de Retirada de Material". A rota que antes devolvia um PDF binário (`GET /:id/pdf`, via `pdfkit`) agora devolve **JSON puro** em:

```
GET /requests/:id/withdrawal-slip
```

Autenticação: `authMiddleware` (Bearer token), igual à rota anterior. Regras de autorização/negócio (inalteradas, aplicadas em `PdfRequestUseCase`):
- 404 se a solicitação não existe.
- 403 se quem chama não é o dono da solicitação nem `ADMIN`.
- 409 se a solicitação está `CANCELED` (`PENDING` e `COMPLETED` são permitidos).
- 404 defensivo se o usuário requisitante não for encontrado.

O corpo da resposta (200) é exatamente este shape (formatação — datas pt-BR, setor traduzido — continua sendo feita no backend, o frontend só exibe):

```ts
interface WithdrawalSlipMaterialDto {
  name: string
  category: string
  quantity: number
  unit: string
}

interface WithdrawalSlipDto {
  requestId: string
  requesterName: string
  sector: string      // já traduzido, ex: "Acadêmico" / "Administrativo"
  deadline: string     // já formatado pt-BR
  createdAt: string    // já formatado pt-BR
  materials: WithdrawalSlipMaterialDto[]
}
```

Cabe ao `Stock-web` construir e exibir/baixar o PDF a partir desses dados, usando **@react-pdf/renderer** (decisão já tomada).

## O que já existe no `Stock-web` (para referência)

- Chamada atual (a ser trocada): `src/api/requests/withdrawalTermApi.ts` — `generateWithdrawalTerm(requestId, token)` usa `apiRequestBlob('/requests/${requestId}/pdf', { token })`.
- Cliente HTTP: `src/lib/http/apiClient.ts` — `apiRequest<T>(path, options)` (JSON) e `apiRequestBlob(path, options)` (binário).
- Download: `src/lib/download.ts` — `downloadBlob(blob, fileName)` (padrão `<a download>` + `URL.createObjectURL`).
- Hook que dispara a geração: `src/pages/solicitacoes/useSolicitacoesPage.ts`, função `handleGeneratePdf(id)` (linhas ~110-122).
- Botão/UI: `src/pages/solicitacoes/components/RequestRow.tsx` (linhas ~111-114) — botão "Gerar PDF do termo" e gate do botão "Concluir pedido" (`disabled={isCompleting || !pdfDone}`).
- Tipos de DTO seguem o padrão `src/types/*.ts` (ex.: `src/types/requests.ts`).

## Passo a passo

1. **Adicionar dependência**: `@react-pdf/renderer` em `Stock-web/package.json`.

2. **Novo tipo** `src/types/withdrawalSlip.ts`, espelhando o DTO do backend (`WithdrawalSlipDto`/`WithdrawalSlipMaterialDto` acima).

3. **Trocar a chamada de API** em `src/api/requests/withdrawalTermApi.ts` (ou renomear o arquivo para `withdrawalSlipApi.ts`, já que deixa de "gerar termo" e passa a "buscar dados do termo"):
   ```ts
   import { apiRequest } from '../../lib/http/apiClient'
   import type { WithdrawalSlipDto } from '../../types/withdrawalSlip'

   export function getWithdrawalSlip(requestId: string, token: string): Promise<WithdrawalSlipDto> {
     return apiRequest<WithdrawalSlipDto>(`/requests/${requestId}/withdrawal-slip`, { token })
   }
   ```

4. **Logo da IFCE**: o backend embutia o logo como PNG em base64 (`src/infrastructure/pdf/assets/ifce-logo.ts`, removido do backend nesta mudança, mas ainda recuperável no histórico do git deste repositório — commit `c1fca79`, ou via `git show HEAD~1:src/infrastructure/pdf/assets/ifce-logo.ts` a partir do commit anterior à remoção). Recomendação: decodificar esse base64 uma única vez e salvar como arquivo binário real em `Stock-web/src/pdf/assets/ifce-logo.png`, importado como asset estático do Vite (`import ifceLogo from './assets/ifce-logo.png'`, usado com `<Image src={ifceLogo} />` do `@react-pdf/renderer`). Evitar duplicar a string base64 num `.ts` do frontend ou buscar o logo via rede a cada geração — é um asset estático de marca, sem variação por request.

5. **Novo componente** `src/pdf/WithdrawalSlipDocument.tsx`, recriando em JSX o layout que antes era desenhado via `pdfkit`:
   - Página A4, margens ~54pt, com espaço reservado na base (~130pt) para o rodapé de assinatura.
   - **Cabeçalho**: logo 44x56 no canto superior direito, label "STOCK", título "Termo de Retirada de Material", subtítulo "Documento de auditoria — controle de saída de materiais do almoxarifado", linha divisória.
   - **Caixa de identificação**: fundo verde-claro, grade 2x2 — REQUISITANTE / SETOR (linha 1), PRAZO / ABERTA EM (linha 2).
   - **Tabela de materiais**: cabeçalho verde-escuro com texto branco (colunas "Item" / "Tipo" / "Quantidade"), linhas zebradas, borda ao redor, linha de total "Total: N material(is) • M unidades" alinhada à direita ao final.
     - Paginação: **não precisa reimplementar** a lógica manual de corte de página do pdfkit (`rowY + rowHeight > contentBottom` / `addPage()`) — o motor de layout do `@react-pdf/renderer` pagina automaticamente desde que cada linha da tabela seja sua própria `View`.
   - **Rodapé de assinatura** (repete em toda página): linha divisória, título "Assinaturas", duas colunas de linha de assinatura ("Assinatura do requisitante" / "Assinatura do responsável pelo almoxarifado"), texto pequeno de auditoria: `Documento gerado eletronicamente pelo sistema STOCK para fins de auditoria — Solicitação ${data.requestId}`.
     - Usar uma `View` com a prop `fixed` posicionada de forma absoluta na base da página — isso resolve nativamente o problema que no pdfkit exigia um workaround manual (listener de `pageAdded` + manipulação do cursor de texto, corrigido no commit `91ecca3` do backend); com `fixed` essa classe de bug simplesmente não existe.
   - **Paleta de cores** (copiar exatamente):
     - `GREEN_DARK #1F5D3A`, `GREEN_ACCENT #2E8B57`, `LIGHT_BG #EEF5F0`, `GRAY_TEXT #5B6472`, `BORDER #D7E4DB`.
   - Copiar os textos/rótulos literalmente (estavam no arquivo removido `withdrawal-slip.pdf.ts`, recuperável via `git show c1fca79:src/infrastructure/pdf/withdrawal-slip.pdf.ts` neste repositório caso seja útil como referência de layout).

6. **Atualizar `handleGeneratePdf`** em `src/pages/solicitacoes/useSolicitacoesPage.ts` para buscar o JSON e renderizar o PDF no client, mantendo o download igual a hoje:
   ```ts
   import { pdf } from '@react-pdf/renderer'
   import { WithdrawalSlipDocument } from '../../pdf/WithdrawalSlipDocument'

   async function handleGeneratePdf(id: string) {
     setPdfNotice(null)
     setGeneratingPdfId(id)
     try {
       const data = await withdrawalSlipApi.getWithdrawalSlip(id, token)
       const blob = await pdf(<WithdrawalSlipDocument data={data} />).toBlob()
       downloadBlob(blob, `termo_retirada_${id}.pdf`)
       setPdfDone((prev) => ({ ...prev, [id]: true }))
     } catch (error) {
       setPdfNotice(errorMessage(error, 'Não foi possível gerar o termo de retirada.'))
     } finally {
       setGeneratingPdfId(null)
     }
   }
   ```
   Como o arquivo passa a conter JSX, renomear `useSolicitacoesPage.ts` → `useSolicitacoesPage.tsx` (ajustando o import em `SolicitacoesPage.tsx`, que já importa sem extensão).

7. **`RequestRow.tsx` não precisa mudar**: mesmos props (`onGeneratePdf`, `isGeneratingPdf`, `pdfDone`, `pdfNotice`), mesmo botão. O gate de "Concluir pedido" (`!pdfDone`) continua igual — agora depende do sucesso da renderização client-side em vez do fetch do PDF pronto.

8. **Limpeza**: `apiRequestBlob`/`fileNameFromDisposition` em `src/lib/http/apiClient.ts` ficam sem uso após essa troca — confirmar que nenhum outro lugar do frontend os chama antes de remover.

## Rollout

A rota mudou de path e de contrato (`/pdf` binário → `/withdrawal-slip` JSON) — é uma mudança quebradiça. Como é ferramenta interna, um deploy único coordenado (backend + frontend) é aceitável. Se for necessário zero-downtime, manter as duas rotas em paralelo por um ciclo antes de remover a antiga é a alternativa mais segura.

## Verificação end-to-end

1. Subir `Stock-api` e `Stock-web` em dev.
2. Logar como ADMIN, abrir "Solicitações", expandir uma solicitação `PENDING`, clicar em "Gerar PDF do termo".
3. Conferir na aba de rede: `GET /requests/:id/withdrawal-slip` retorna 200 JSON com o shape esperado; nenhuma requisição de rede busca um PDF pronto (ele é gerado no client).
4. Comparar visualmente o PDF baixado com um PDF gerado pela versão anterior (gerar um de referência antes de remover o código antigo do backend, ou recuperar via `git show c1fca79` neste repo para reconstituir a versão antiga temporariamente em um branch separado).
5. Testar uma solicitação com materiais suficientes para forçar quebra de página e confirmar que o rodapé de assinatura aparece em todas as páginas.
6. Confirmar que "Concluir pedido" continua desabilitado antes de gerar o PDF e habilita depois.
7. Testar caso de erro 409 (solicitação `CANCELED` — só acessível via chamada direta à API, já que a UI só mostra os controles para `PENDING`) e confirmar que a mensagem de erro aparece via `pdfNotice`.
8. Rodar typecheck/lint do `Stock-web` para garantir que não sobrou nenhuma referência ao fluxo de blob antigo.
