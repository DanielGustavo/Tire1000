# 02 — Cadastro e login

**What to build:** Usuário cria conta com nome, email e senha, e faz login, recebendo tokens. Rotas subsequentes passam a exigir autenticação. Sem login social (fora de escopo do MVP).

**Blocked by:** 01 — Scaffolding do projeto

**Status:** ready-for-agent

- [x] User Pool do Cognito configurado, com conta auto-verificada no cadastro
- [x] `POST /auth/signup { name, email, password }` cria a conta no Cognito e o registro de `User` no DynamoDB, com `credits: 0`
- [x] `POST /auth/login { email, password }` autentica via Cognito e retorna tokens
- [x] Rotas autenticadas passam pelo authorizer do Cognito
- [x] Testes Vitest dos casos de uso `SignUpUser`/`Login` com fakes de Cognito e do repositório de `User`
- [x] Telas de cadastro e login no front, integradas à API

## Comments

Implementado. Backend: `AuthGateway` (porta) com `CognitoAuthGateway` (implementação real via `AdminCreateUser`/`AdminSetUserPassword`/`AdminInitiateAuth`/`AdminDeleteUser` — conta criada já confirmada e com `email_verified: true`, sem fluxo de verificação por email) e `InMemoryAuthGateway` (fake). `DynamoUserRepository` real (PK/SK `USER#<id>`, GSI1 `USER#<email>`) ao lado do `InMemoryUserRepository` já existente. Casos de uso `SignUpUser` (cria conta no Cognito → grava `User` com `credits: 0` → retorna tokens via login; reverte a conta no Cognito se a gravação no DynamoDB falhar) e `Login` (delega ao `AuthGateway`), ambos testados só com fakes. Handlers finos em `src/handlers/auth/{signup,login}.ts`, mapeando `EmailAlreadyExistsError`→409, `WeakPasswordError`→400, `InvalidCredentialsError`→401. `serverless.yml`: `CognitoUserPool`/`CognitoUserPoolClient` + authorizer JWT `cognitoAuthorizer` no `httpApi` (disponível para as próximas rotas autenticadas), permissões IAM mínimas (Dynamo + Cognito admin actions). Frontend: `SignupPage`/`LoginPage` em `src/pages/`, `src/api/auth.ts` chamando a API, token de acesso persistido via `apiClient` (interceptor injeta `Authorization: Bearer`).
