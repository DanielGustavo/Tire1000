# Mover pages/essay-upload/ para src/flows/essayCapture/

Type: task

Status: resolved

## Question

`frontend/src/pages/essay-upload/` não é uma rota (ausente de `App.tsx`) — é um fluxo de captura/upload de foto compartilhado, consumido por `pages/themes/components/EssayUploadFlow.tsx` (novo envio) e `pages/home/components/EssayResendFlow.tsx` (reenvio). Estar sob `pages/` quebra a convenção implícita do resto do código de que todo diretório em `pages/` é 1:1 com uma rota.

Mover:
- `frontend/src/pages/essay-upload/useEssayCaptureFlow.ts` → `frontend/src/flows/essayCapture/hooks/useEssayCaptureFlow.ts`
- `frontend/src/pages/essay-upload/components/*.tsx` (`CameraPermissionModal`, `PhotoConfirmationErrorModal`, `PhotoConfirmationLoadingModal`, `PhotoConfirmationModal`, `TipsModal`) → `frontend/src/flows/essayCapture/components/`

Atualizar todos os imports que hoje apontam pra `../../essay-upload/...` ou `../essay-upload/...`:
- `frontend/src/pages/themes/components/EssayUploadFlow.tsx`
- `frontend/src/pages/themes/components/useEssayUploadFlow.ts`
- `frontend/src/pages/themes/useThemeDetailPage.ts` (importa só o tipo `EssayUploadMode`)
- `frontend/src/pages/home/components/EssayResendFlow.tsx`
- `frontend/src/pages/home/components/useEssayResendFlow.ts`

Nome da pasta (`essayCapture`) já em camelCase — não precisa passar pela ticket de rename (04). O nome ecoa o vocabulário que já existe no código (`useEssayCaptureFlow`, `EssayUploadFlow`, `EssayResendFlow`), preferido a introduzir "features" como termo novo.

Não mexer no conteúdo de `pages/themes/components/useEssayUploadFlow.ts`/`pages/home/components/useEssayResendFlow.ts` além dos imports — a movimentação desses dois arquivos pra fora de `components/` é escopo da ticket [Extrair hooks colocalizados em components/ para hooks/ de cada página](03-extrair-hooks-de-components.md).

## Answer

Feito exatamente como especificado:

**Arquivos movidos** (`git mv`):
- `frontend/src/pages/essay-upload/useEssayCaptureFlow.ts` → `frontend/src/flows/essayCapture/hooks/useEssayCaptureFlow.ts`
- `frontend/src/pages/essay-upload/components/CameraPermissionModal.tsx` → `frontend/src/flows/essayCapture/components/CameraPermissionModal.tsx`
- `frontend/src/pages/essay-upload/components/PhotoConfirmationErrorModal.tsx` → `frontend/src/flows/essayCapture/components/PhotoConfirmationErrorModal.tsx`
- `frontend/src/pages/essay-upload/components/PhotoConfirmationLoadingModal.tsx` → `frontend/src/flows/essayCapture/components/PhotoConfirmationLoadingModal.tsx`
- `frontend/src/pages/essay-upload/components/PhotoConfirmationModal.tsx` → `frontend/src/flows/essayCapture/components/PhotoConfirmationModal.tsx`
- `frontend/src/pages/essay-upload/components/TipsModal.tsx` → `frontend/src/flows/essayCapture/components/TipsModal.tsx`

O diretório `pages/essay-upload/` (agora vazio) foi removido.

**Imports atualizados** — os 5 arquivos consumidores listados na ticket (grep na árvore inteira de `frontend/src` confirmou que essa lista já era completa, nenhum consumidor extra encontrado):
- `frontend/src/pages/themes/components/EssayUploadFlow.tsx`
- `frontend/src/pages/themes/components/useEssayUploadFlow.ts`
- `frontend/src/pages/themes/useThemeDetailPage.ts`
- `frontend/src/pages/home/components/EssayResendFlow.tsx`
- `frontend/src/pages/home/components/useEssayResendFlow.ts`

Além disso, encontrei e corrigi 2 imports internos quebrados dentro dos próprios arquivos movidos (não listados na ticket, mas necessários pro build passar): `flows/essayCapture/components/PhotoConfirmationModal.tsx` e `flows/essayCapture/components/TipsModal.tsx` importavam o tipo `EssayUploadMode` via `../useEssayCaptureFlow` (caminho relativo válido quando o hook era irmão de `components/` dentro de `pages/essay-upload/`) — corrigido para `../hooks/useEssayCaptureFlow` já que o hook agora mora em `hooks/`, um nível abaixo de `components/`.

Nenhum outro conteúdo dos arquivos movidos ou dos consumidores foi alterado além dos caminhos de import.

**Verificação**: `cd frontend && npx tsc -b` não aponta nenhum erro relacionado a `essay-upload`/`flows/essayCapture` ou a qualquer um dos arquivos tocados nesta ticket. Os únicos erros reportados são em `layouts/AppLayout`/`App.tsx`, do trabalho concorrente da ticket 06 (fora do escopo desta ticket).

Nenhum teste novo foi adicionado — reorganização mecânica, conforme convenção do `CLAUDE.md`/Notes do map.
