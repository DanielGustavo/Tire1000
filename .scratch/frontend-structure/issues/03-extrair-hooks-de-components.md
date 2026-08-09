# Extrair hooks colocalizados em components/ para hooks/ de cada página

Type: task

Blocked by: 02

Status: resolved

## Question

Hooks acoplados a um componente/sub-fluxo específico de uma página vivem hoje dentro da própria pasta `components/` da página, misturados com os componentes de UI. Movê-los pra uma pasta `hooks/` própria de cada página, espelhando `components/`:

- `frontend/src/pages/home/components/useEssaysSection.ts` → `frontend/src/pages/home/hooks/useEssaysSection.ts`
  - atualizar import em `frontend/src/pages/home/components/EssaysSection.tsx`
- `frontend/src/pages/home/components/useEssayResendFlow.ts` → `frontend/src/pages/home/hooks/useEssayResendFlow.ts`
  - atualizar import em `frontend/src/pages/home/components/EssayResendFlow.tsx`
- `frontend/src/pages/themes/components/useEssayUploadFlow.ts` → `frontend/src/pages/themes/hooks/useEssayUploadFlow.ts`
  - atualizar import em `frontend/src/pages/themes/components/EssayUploadFlow.tsx`
- `frontend/src/pages/landing/components/useSignUpWizard.ts` → `frontend/src/pages/landing/hooks/useSignUpWizard.ts`
  - atualizar import em `frontend/src/pages/landing/components/SignUpModal.tsx`
  - `useSignUpWizard.ts` importa `signup-schema.ts` (mesma pasta `components/`) — o schema **não** muda de pasta nesta ticket (fica em `components/`, é consumido pelo form em `SignUpModal.tsx` também); só ajustar o caminho relativo do import.

**Não mover** os hooks de topo de página que já vivem soltos na raiz da pasta (`pages/essay-result/useEssayResultPage.ts`, `pages/themes/useThemesPage.ts`, `pages/themes/useThemeDetailPage.ts`) — esses representam o estado da página inteira, não de um componente específico, e ficam onde estão por decisão do mapa (ver `../map.md` → Notes).

`pages/home` e `pages/landing` não têm hoje pasta `hooks/` nem hook de topo de página — só criar `hooks/` com os arquivos movidos, sem criar um `use<Página>Page.ts` que não existia.

## Answer

Os 4 hooks foram movidos com `git mv` para pastas `hooks/` novas (criadas em `pages/home/`, `pages/themes/` e `pages/landing/`):

- `pages/home/components/useEssaysSection.ts` → `pages/home/hooks/useEssaysSection.ts`; import atualizado em `EssaysSection.tsx` (`"./useEssaysSection"` → `"../hooks/useEssaysSection"`).
- `pages/home/components/useEssayResendFlow.ts` → `pages/home/hooks/useEssayResendFlow.ts`; import atualizado em `EssayResendFlow.tsx`.
- `pages/themes/components/useEssayUploadFlow.ts` → `pages/themes/hooks/useEssayUploadFlow.ts`; import atualizado em `EssayUploadFlow.tsx`.
- `pages/landing/components/useSignUpWizard.ts` → `pages/landing/hooks/useSignUpWizard.ts`; import atualizado em `SignUpModal.tsx`. O próprio `useSignUpWizard.ts` teve seu import relativo de `signup-schema.ts` ajustado de `"./signup-schema"` para `"../components/signup-schema"` — o schema continua em `components/`, não foi movido.

Os imports internos dos 4 hooks (`../../../services/...`, `../../../libs/...`, `../../../flows/essayCapture/hooks/useEssayCaptureFlow`) não precisaram de ajuste: `hooks/` tem a mesma profundidade que `components/` dentro de cada página, então os caminhos relativos de 3 níveis continuam corretos.

Um grep na árvore inteira por `useEssaysSection|useEssayResendFlow|useEssayUploadFlow|useSignUpWizard` confirmou que não há importadores além dos 4 já listados na ticket. Os hooks de topo de página (`useEssayResultPage.ts`, `useThemesPage.ts`, `useThemeDetailPage.ts`) não foram tocados, como determinado.

`npx tsc -b` (com `--force` para forçar recompilação completa) rodou limpo, sem erros.

Reorganização mecânica — sem lógica nova, sem teste adicionado (convenção do `CLAUDE.md`/map.md Notes).
