# 02 — Cadastro e login

**What to build:** Usuário cria conta com nome, email e senha, e faz login, recebendo tokens. Rotas subsequentes passam a exigir autenticação. Sem login social (fora de escopo do MVP).

**Blocked by:** 01 — Scaffolding do projeto

**Status:** ready-for-agent

- [ ] User Pool do Cognito configurado, com conta auto-verificada no cadastro
- [ ] `POST /auth/signup { name, email, password }` cria a conta no Cognito e o registro de `User` no DynamoDB, com `credits: 0`
- [ ] `POST /auth/login { email, password }` autentica via Cognito e retorna tokens
- [ ] Rotas autenticadas passam pelo authorizer do Cognito
- [ ] Testes Vitest dos casos de uso `SignUpUser`/`Login` com fakes de Cognito e do repositório de `User`
- [ ] Telas de cadastro e login no front, integradas à API
