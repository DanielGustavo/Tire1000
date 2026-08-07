# Role e env vars dedicados para `authPreTokenGeneration`, pra quebrar o ciclo com `CognitoUserPool`

O deploy passou a falhar com `ServerlessError2: The CloudFormation template is invalid: Circular dependency between resources`, listando praticamente todo recurso do stack (rotas, integrations, outras Lambdas sem nenhuma relação com Cognito).

A causa raiz é bem menor do que a lista sugere: `CognitoUserPool.Properties.LambdaConfig.PreTokenGenerationConfig.LambdaArn` referencia `AuthPreTokenGenerationLambdaFunction` (Cognito → Lambda). Essa mesma Lambda, como todas as outras, herdava o role de execução compartilhado (`IamRoleLambdaExecution`) — cuja statement de `cognito-idp:Admin*` referencia `CognitoUserPool.Arn` — e as env vars globais `USER_POOL_ID`/`USER_POOL_CLIENT_ID`, ambas `!Ref CognitoUserPool`. Isso fechava o ciclo (Lambda → role/env → Cognito → Lambda). Como o role de execução é compartilhado por todas as functions, o CloudFormation reporta o componente conectado inteiro ao detectar o ciclo — daí a lista gigante no erro, mesmo sem relação direta com Cognito.

`authPreTokenGeneration` (`src/main/handlers/auth/pre-token-generation.ts`) só lê `custom:userId` do evento e não usa nenhuma das duas env vars nem nenhuma ação `cognito-idp:*` — só `signup.ts`/`login.ts` (via `CognitoAuthGateway`) usam isso.

## Decisão

- `authPreTokenGeneration` ganhou um `AWS::IAM::Role` próprio (`AuthPreTokenGenerationRole`, em `sls/resources/cognito.yml`), só com `AWSLambdaBasicExecutionRole` (logs) — sem nenhuma statement que referencie `CognitoUserPool.Arn`. As outras functions continuam no role compartilhado.
- `USER_POOL_ID`/`USER_POOL_CLIENT_ID` saíram de `provider.environment` (global) e passaram a ser setadas só em `authSignup`/`authLogin` (`sls/functions/auth.yml`), as únicas que os usam.

Optamos pelo fix mínimo (isolar só `authPreTokenGeneration`) em vez de mover todas as 10 functions para roles individuais least-privilege — resolve o ciclo com o menor diff possível; o refactor completo fica pra quando/se valer a pena por si só.

## Consequência

Qualquer novo Lambda trigger nativo do Cognito (`LambdaConfig`) precisa seguir o mesmo padrão: role e env vars isolados do que referencia `CognitoUserPool`, senão o ciclo volta.
