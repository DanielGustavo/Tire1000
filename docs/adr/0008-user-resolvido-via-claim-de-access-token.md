# User resolvido via claim `userId` no access token, sem GSI2

Substitui a [ADR-0006](./0006-user-resolvido-via-gsi2-por-externalid.md).

A ADR-0006 resolvia o `User` logado consultando `GSI2` por `externalId` (o `sub` do Cognito) a cada requisição autenticada. Isso funcionava, mas acoplava toda rota autenticada a uma consulta extra ao DynamoDB só para traduzir `sub` → `User` interno — e reservava o `GSI2` do item `User` para esse único propósito.

Trocamos essa tradução em runtime por uma tradução feita uma única vez, no momento do signup: `SignUpUser` agora gera o `id` interno (KSUID) *antes* de chamar `AuthGateway#signUp`, e o Cognito grava esse `id` como atributo customizado `custom:userId` do usuário (`AdminCreateUserCommand`, ver `CognitoAuthGateway#signUp`).

Um trigger `PreTokenGeneration` (versão `V2_0`, `src/main/handlers/auth/pre-token-generation.ts`) lê `custom:userId` diretamente de `event.request.userAttributes` — sem nenhuma chamada ao DynamoDB — e injeta esse valor como a claim `userId` no access token (`accessTokenGeneration.claimsToAddOrOverride`). A claim `userId` só existe no access token porque o front-end autentica as rotas com o access token, não o id token (que ganharia atributos customizados automaticamente, sem precisar de trigger).

`resolveAuth` (`apigw-adapter.ts`) passou a ler a claim `userId` em vez de `sub`, e `ControllerAuth` carrega `{ id: string }` — o id interno, não mais o `externalId`. `GetCurrentUser` e `RequestCreditsCheckout` passaram a usar `UserRepository#findById`, que já existia. `UserRepository#findByExternalId` foi removido (não tinha mais chamador), e o item `User` no DynamoDB parou de gravar `GSI2PK`/`GSI2SK` — o `GSI2` da tabela continua existindo (compartilhado com `Theme`/`ReferenceText`, ver ADR-0004), só o `User` deixou de usá-lo.

O campo `externalId` (o `sub` do Cognito) continua existindo na entidade `User` e no item do DynamoDB como um atributo simples, não indexado — só para referência/depuração, sem nenhum código de produção consultando por ele.
