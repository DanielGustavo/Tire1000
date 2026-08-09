# `AuthContext` único + guarda de rota pras páginas autenticadas

Status: ready-for-agent

Ver ADR-0014.

## Contexto

Existem 4 chamadas independentes a `GET /users/me`, cada uma com sua própria query React Query e cache (`["currentUser"]`), sem nenhum contexto compartilhado: `AppLayout.tsx:42` (`UserMenu`), `AppLayout.tsx:98` (`AppLayout`), `credits.tsx:22`, `useThemeDetailPage.ts:19`. `RootRoute` (`App.tsx:11-19`) decide landing vs. app lendo `getAccessToken()` direto do `localStorage` a cada render, sem estado reativo — login/logout dependem de `navigate("/")` forçar reavaliação. Além disso, `/themes`, `/themes/:id`, `/essays/:id`, `/credits` (`App.tsx:25-30`) não têm nenhuma guarda de autenticação hoje: visitar uma dessas URLs deslogado (ex. sessão expirada, bookmark antigo) não redireciona pra lugar nenhum.

## Escopo

- Um `AuthProvider` no topo da árvore (acima do `<Routes>` em `App.tsx`), guardando a query de `/me` uma única vez: `{ user, isLoading, refetch }`.
- Todo call site que hoje chama `useQuery({ queryKey: ["currentUser"], ... })` (os 4 listados acima) passa a consumir o contexto.
- `RootRoute` e um novo wrapper `RequireAuth` (envolvendo `/themes`, `/themes/:themeId`, `/essays/:essayId`, `/credits`) leem "está autenticado" do contexto, não de `getAccessToken()` direto.
- `RequireAuth` redireciona pra `/` quando não há sessão válida — **bounce simples**, sem preservar/retornar pro destino original depois de logar (decisão explícita: não vale a complexidade de passar `location.state` pro modal de login, já que não existe rota `/login` dedicada).
- Login/logout devem atualizar o contexto e refletir na UI sem depender do truque atual de `navigate("/")` forçar remount.

## Referências

- `frontend/src/App.tsx:11-30`
- `frontend/src/layouts/AppLayout.tsx:42,53-56,98`
- `frontend/src/pages/credits.tsx:22`
- `frontend/src/pages/themes/useThemeDetailPage.ts:19`
