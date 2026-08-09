# Extrair hooks colocalizados em components/ para hooks/ de cada página

Type: task

Blocked by: 02

Status: open

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
