# Extrair useOnClickOutside pra hooks/app/

Type: task

Blocked by: 06, 07

Status: resolved

## Question

O padrão "fechar ao clicar fora" (ref + listener de `mousedown` no `document` + cleanup no effect) está duplicado quase identicamente em 3 lugares:

- `frontend/src/layouts/AppLayout/components/UserMenu.tsx` (após a ticket [Dividir AppLayout.tsx](06-dividir-applayout.md)) — fecha o menu de usuário
- `frontend/src/components/Select.tsx` — fecha a lista de opções
- `frontend/src/pages/essay-result/components/HighlightedEssayText.tsx` — fecha o popup de comentário do avaliador; **este caso tem lógica extra** (também fecha em `scroll`/`resize` da window) além do clique fora — ao extrair, mantenha esse comportamento adicional local ao componente (não force scroll/resize pra dentro do hook genérico, a menos que fique claramente mais simples fazer isso).

Extrair `frontend/src/hooks/app/useOnClickOutside.ts` — assinatura sugerida: `useOnClickOutside<T extends HTMLElement>(ref: RefObject<T | null>, onOutsideClick: () => void, active: boolean)`, registrando/removendo o listener de `mousedown` conforme `active`. Ajustar os 3 consumidores pra usá-lo, preservando o comportamento atual de cada um (inclusive o caso extra de `HighlightedEssayText.tsx`).

## Answer

Criado `frontend/src/hooks/app/useOnClickOutside.ts` com a assinatura sugerida, com uma única adaptação: `ref` aceita um `RefObject<T | null>` único **ou** um array deles — `useOnClickOutside<T extends HTMLElement>(ref: RefObject<T | null> | RefObject<T | null>[], onOutsideClick: () => void, active: boolean)`. Um clique só conta como "fora" se estiver fora de todos os refs passados. Essa adaptação foi necessária porque `Select.tsx` já checava dois refs (`rootRef` do trigger e `listboxRef` da lista de opções, que é portada pra `document.body` via `createPortal` — logo não é descendente do trigger no DOM). Sem suportar múltiplos refs, um `mousedown` numa opção seria tratado como clique-fora e fecharia a lista antes do `click` disparar `selectOption`, quebrando a seleção. O hook internamente normaliza pra array e faz `refs.some((r) => r.current?.contains(target))`.

Os 3 consumidores foram migrados preservando comportamento exato:
- `UserMenu.tsx`: `useOnClickOutside(rootRef, () => onOpenChange(false), open)` — uso de ref único, bate com a assinatura sugerida ao pé da letra.
- `Select.tsx`: `useOnClickOutside([rootRef, listboxRef], close, open)` — usa a forma de array descrita acima.
- `HighlightedEssayText.tsx`: `useOnClickOutside([popupRef, openMarkRef], () => setPopup(null), popup !== null)` pro clique-fora; o `scroll`/`resize` da window que também fecha o popup (posicionamento é feito via viewport, não CSS-anchored) ficou num `useEffect` local separado, como pedido — não foi generalizado pro hook.

`npx tsc -b` limpo. Nenhum teste dedicado foi criado — lógica de listener simples, sem ramificação não-trivial nova, conforme convenção de teste deste repo.
