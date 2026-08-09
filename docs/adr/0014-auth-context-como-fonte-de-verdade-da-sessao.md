# `AuthContext` como fonte de verdade de sessão, substituindo leitura direta de `localStorage`

O app tinha 4 chamadas independentes a `GET /users/me` (uma por componente que precisava do usuário atual), e `RootRoute` decidia landing vs. app lendo `getAccessToken()` direto do `localStorage` a cada render — sem nenhum estado reativo de autenticação. Login/logout dependiam de `navigate("/")` forçar um remount pra essa leitura se atualizar, mesmo já estando em `/`.

## Decisão

Um `AuthProvider` único, no topo da árvore, guarda a query de `/me` (`{ user, isLoading, refetch }`) e vira a fonte de verdade de "está autenticado" — `RootRoute` e as rotas protegidas (`RequireAuth`, novo wrapper em `/themes`, `/themes/:id`, `/essays/:id`, `/credits`) leem do contexto em vez de chamar `getAccessToken()` diretamente. Login/logout atualizam o contexto e a UI reage sem depender do truque de `navigate("/")` pra forçar reavaliação.

## Consequência

Rotas que hoje não tinham nenhuma guarda de autenticação (`/themes`, `/themes/:id`, `/essays/:id`, `/credits`) passam a redirecionar pra `/` quando a sessão está ausente/expirada — antes, visitar uma dessas URLs deslogado não fazia nada. Novos componentes que precisam do usuário atual devem consumir o contexto, não abrir uma nova query própria de `/me`.
