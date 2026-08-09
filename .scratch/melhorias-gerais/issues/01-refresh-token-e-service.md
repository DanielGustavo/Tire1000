# Refresh token consumido de verdade + header de auth movido pra classe `Service`

Status: ready-for-agent

Ver ADR-0013.

## Contexto

`refreshToken` já vem do backend (Cognito, login/signup) mas nunca é persistido nem usado — só `accessToken` vai pro `localStorage` (`frontend/src/libs/auth.ts`). Não existe endpoint de refresh no backend nem tratamento de 401 no frontend. O header `Authorization` é injetado por um interceptor solto em `frontend/src/libs/axios.ts:8-14`, compartilhado por todo `Service` sem que a classe base (`frontend/src/services/service.ts`) tenha qualquer papel nisso.

## Escopo

- **Backend**: novo endpoint `POST /auth/refresh`, usando o fluxo `REFRESH_TOKEN_AUTH` do Cognito (mesmo gateway de `cognito-auth-gateway.ts`).
- **Frontend — persistência**: `refreshToken` passa a ser salvo no `localStorage` junto do `accessToken` (mesmo mecanismo hoje usado, sem cookies).
- **Frontend — interceptor**: em 401, chama `/auth/refresh`, reexecuta a request original uma vez com o novo `accessToken`; se o refresh também falhar, força logout (mesmo caminho do `handleSignOut` de `AppLayout.tsx`).
- **Frontend — reorganização**: a injeção do header `Authorization` e a lógica de refresh/retry migram de `libs/axios.ts` pra dentro da classe base `Service` (`services/service.ts`). `libs/axios.ts` vira só uma fábrica de `AxiosInstance`, sem nenhuma noção de autenticação.

## Referências

- `frontend/src/libs/axios.ts:8-14`
- `frontend/src/services/service.ts`
- `frontend/src/libs/auth.ts`
- `frontend/src/services/auth-service.ts:6` (`AuthTokens.refreshToken`, já tipado, nunca persistido)
- `backend/src/infra/gateways/cognito-auth-gateway.ts:91-98`
- `backend/src/application/dtos/auth-tokens-dto.ts:5`
