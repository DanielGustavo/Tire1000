# Dividir AppLayout.tsx em pasta própria

Type: task

Status: resolved

## Question

`frontend/src/layouts/AppLayout.tsx` define 4 componentes num único arquivo: `Header`, `UserMenu`, `Footer` (locais, não exportados) e `AppLayout` (exportado, usado em `App.tsx`).

Reorganizar em pasta própria, espelhando a convenção já usada por página (`pages/<nome>/<nome>.tsx` + `components/`):

- `frontend/src/layouts/AppLayout/AppLayout.tsx` — só o componente `AppLayout` exportado
- `frontend/src/layouts/AppLayout/components/Header.tsx`
- `frontend/src/layouts/AppLayout/components/UserMenu.tsx`
- `frontend/src/layouts/AppLayout/components/Footer.tsx`

Atualizar o import em `frontend/src/App.tsx`: `./layouts/AppLayout` → `./layouts/AppLayout/AppLayout` (sem arquivo `index.ts`/barrel — nenhuma página do repo usa esse padrão hoje, manter consistência).

`Header`/`UserMenu`/`Footer` não são exportados hoje (só usados dentro do próprio arquivo) — ao virarem arquivos próprios, exportá-los normalmente (`export function Header(...)`), sem mudar assinatura/comportamento.

## Answer

`frontend/src/layouts/AppLayout.tsx` dividido em pasta própria, sem `index.ts`/barrel:

- `frontend/src/layouts/AppLayout/AppLayout.tsx` — só o componente `AppLayout` exportado, agora importando `Header` e `Footer` de `./components/`.
- `frontend/src/layouts/AppLayout/components/Header.tsx` — `Header` como export nomeado, importando `UserMenu` de `./UserMenu`.
- `frontend/src/layouts/AppLayout/components/UserMenu.tsx` — `UserMenu` como export nomeado.
- `frontend/src/layouts/AppLayout/components/Footer.tsx` — `Footer` como export nomeado.

Assinaturas/comportamento preservados integralmente; só mudou a export-ness de `Header`/`UserMenu`/`Footer` (viram exports nomeados normais) e a localização dos arquivos. Import em `frontend/src/App.tsx` atualizado de `./layouts/AppLayout` para `./layouts/AppLayout/AppLayout` — nenhuma outra linha de `App.tsx` foi tocada. `npx tsc -b` limpo depois da divisão. Sem teste novo (reorganização mecânica, conforme convenção do `CLAUDE.md`).
