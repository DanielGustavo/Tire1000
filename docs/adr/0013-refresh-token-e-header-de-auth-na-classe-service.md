# Refresh token consumido via interceptor na classe `Service`, não mais um artefato descartado

O backend sempre devolveu `refreshToken` (login/signup, via Cognito) mas o frontend nunca o persistia nem o usava — só `accessToken` ia pro `localStorage`, sem endpoint de refresh no backend e sem tratamento de 401 no frontend. Sessões expiravam exigindo login manual.

## Decisão

`refreshToken` passa a ser persistido no `localStorage` junto do `accessToken` (mesmo mecanismo, sem cookies — nenhuma parte do app usa cookies hoje). Um novo endpoint `POST /auth/refresh` (Cognito `REFRESH_TOKEN_AUTH`) é consumido por um interceptor de resposta: em 401, tenta refresh e reexecuta a request original uma vez; se o refresh também falhar, força logout. Essa lógica — junto da injeção do header `Authorization`, que antes vivia solta em `libs/axios.ts` — passa a viver na classe base `Service` (`frontend/src/services/service.ts`), que toda `*Service` estende. `libs/axios.ts` vira só uma fábrica de `AxiosInstance` sem noção de autenticação.

Optamos por manter tokens em `localStorage` (em vez de migrar pra cookie `httpOnly`, mais resistente a XSS) pra não abrir uma frente de mudança de infra de cookies/CORS só por causa do refresh — é consistente com o padrão já estabelecido pro access token.

## Consequência

Qualquer novo `*Service` ganha o refresh automático de graça, por herdar de `Service` — não deve reimplementar header/interceptor por conta própria. Se a exposição do refresh token a XSS via `localStorage` virar preocupação real, revisitar pra cookie `httpOnly` é a migração natural (exigiria mudanças no backend também).
