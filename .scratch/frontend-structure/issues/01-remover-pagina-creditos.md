# Remover página de créditos não utilizada

Type: task

Status: resolved

## Question

`frontend/src/pages/credits.tsx` (rota `/credits` em `App.tsx`) não é mais referenciada por nenhum ponto de entrada do app — confirmado por grep: nenhum `<Link>`/`navigate` aponta pra `/credits` em lugar nenhum do código, só o próprio registro da rota em `App.tsx` e o arquivo em si. A compra de créditos hoje acontece inteiramente pelo `components/PriceModal.tsx`, que já importa `services/credits-service.ts` diretamente.

Remover:
- `frontend/src/pages/credits.tsx`
- A rota `<Route path="/credits" element={<CreditsPage />} />` e o import de `CreditsPage` em `frontend/src/App.tsx`

Manter:
- `frontend/src/services/credits-service.ts` — ainda usado por `PriceModal.tsx`

Antes de remover, rode `grep -rn "credits" frontend/src` de novo pra confirmar que nada mudou desde o levantamento desta ticket (outra ticket do mapa pode ter mexido em arquivos vizinhos). Rode `tsc -b`/build do frontend depois da remoção pra garantir que nada mais referenciava `CreditsPage`.

## Answer

Confirmado por `grep -rn "credits" frontend/src` que nenhum lugar além de `App.tsx` e do próprio `pages/credits.tsx` referenciava a rota — `credits-service.ts` seguia usado só por `PriceModal.tsx`, como esperado.

Removido:
- `frontend/src/pages/credits.tsx`
- Import de `CreditsPage` e a rota `<Route path="/credits" .../>` em `frontend/src/App.tsx`

`npx tsc -b` no frontend rodou limpo depois da remoção — nenhum import quebrado.
