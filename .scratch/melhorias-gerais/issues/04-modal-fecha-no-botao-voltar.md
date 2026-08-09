# Modal fecha com o botão voltar do navegador/celular

Status: ready-for-agent

## Contexto

Desde a remoção das rotas dedicadas a modal (`/essays/new`, `/login`, `/signup` — ver `.scratch/frontend-redesign/issues/08-modais-sem-rota.md`), todo modal é `useState` local, sem nenhuma integração com `history`/`popstate`. O botão voltar do navegador (ou o gesto/botão voltar do celular) não fecha nenhum modal hoje.

## Escopo

- Construir uma vez, dentro do componente compartilhado `Modal` (`frontend/src/components/Modal.tsx`): ao montar, `history.pushState` uma entrada; ao receber `popstate`, chamar o `onClose` já recebido via prop.
- Zero mudança nos call sites — todo modal do app (`SignInModal`, `SignUpModal`, `ThemesFilterModal`, `PriceModal`, `TipsModal`, `CameraPermissionModal`, `PhotoConfirmationModal`, `PhotoConfirmationErrorModal`, `EssayResendFlow`, etc.) ganha o comportamento automaticamente por usar `Modal`.
- Fechar pelo X/backdrop/Esc (fluxo normal) não deve deixar uma entrada de history órfã — consumir/limpar a entrada pushada quando o modal fecha por outro caminho que não o `popstate`.

## Referências

- `frontend/src/components/Modal.tsx`

## Comments

Implementado em `27a321c`. `Modal.tsx` dá `history.pushState` ao montar e fecha via `onClose` num `popstate`; um ref marca quando o fechamento veio do popstate, e o cleanup do efeito só chama `history.back()` (consumindo a entrada pushada) quando o fechamento **não** veio do botão voltar — evita tanto entrada órfã quanto duplo pop. Zero mudança nos call sites, confirmado em `SignInModal`/`SignUpModal`/`PriceModal`. Sem teste dedicado (não há runner de testes no frontend; comportamento é puramente de UI). `tsc -b`/`oxlint` limpos.
