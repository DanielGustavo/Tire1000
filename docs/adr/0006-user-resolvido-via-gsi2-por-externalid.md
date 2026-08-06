# User resolvido via GSI2 pelo externalId (sub do Cognito)

> **Substituída pela [ADR-0008](./0008-user-resolvido-via-claim-de-access-token.md).** `User` não usa mais `GSI2` — o id interno passou a chegar via claim do access token.

A ticket 04 introduziu a primeira rota autenticada que precisa saber *quem* é o usuário logado, não só que ele está logado (`POST /credits/checkout`, `GET /users/me`). O authorizer JWT do API Gateway só disponibiliza as claims do access token do Cognito — na prática, `sub` — e o `sub` é exatamente o `externalId` já gravado em `User`.

Como o modelo original só indexava `User` por `id` (PK) e `email` (GSI1), não havia como resolver `User` a partir do `sub` sem um Scan. `User` passou a usar também o GSI2 (já existente na tabela, mas até então livre pra essa entidade): `GSI2PK`/`GSI2SK = USER_EXTERNAL_ID#<externalId>`. Não colide com o uso de GSI2 por `Theme`/`ReferenceText` (`THEME#<themeId>`, ver ADR-0004) — GSI2 é compartilhado pela tabela toda, mas cada entidade usa seu próprio prefixo.

`UserRepository` ganhou `findByExternalId`. Usado por `RequestCreditsCheckout` e `GetCurrentUser` — não por `ConfirmCreditsCheckout` (o webhook já resolve o usuário via `Checkout.userId`, gravado no momento da criação do checkout, sem precisar de mais uma consulta) nem por `SignUpUser` (que já tem o `User` recém-criado em mãos, evitando depender da consistência eventual do GSI logo após o `PutItem`).
