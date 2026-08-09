# Extrair useOnClickOutside pra hooks/app/

Type: task

Blocked by: 06, 07

Status: open

## Question

O padrão "fechar ao clicar fora" (ref + listener de `mousedown` no `document` + cleanup no effect) está duplicado quase identicamente em 3 lugares:

- `frontend/src/layouts/AppLayout/components/UserMenu.tsx` (após a ticket [Dividir AppLayout.tsx](06-dividir-applayout.md)) — fecha o menu de usuário
- `frontend/src/components/Select.tsx` — fecha a lista de opções
- `frontend/src/pages/essay-result/components/HighlightedEssayText.tsx` — fecha o popup de comentário do avaliador; **este caso tem lógica extra** (também fecha em `scroll`/`resize` da window) além do clique fora — ao extrair, mantenha esse comportamento adicional local ao componente (não force scroll/resize pra dentro do hook genérico, a menos que fique claramente mais simples fazer isso).

Extrair `frontend/src/hooks/app/useOnClickOutside.ts` — assinatura sugerida: `useOnClickOutside<T extends HTMLElement>(ref: RefObject<T | null>, onOutsideClick: () => void, active: boolean)`, registrando/removendo o listener de `mousedown` conforme `active`. Ajustar os 3 consumidores pra usá-lo, preservando o comportamento atual de cada um (inclusive o caso extra de `HighlightedEssayText.tsx`).
