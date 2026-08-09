# Mover pages/essay-upload/ para src/flows/essayCapture/

Type: task

Status: open

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
