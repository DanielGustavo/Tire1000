# Backend

TypeScript on Lambda, deployed with Serverless Framework, single DynamoDB table. See `../CONTEXT.md` and `../.scratch/tire1000-mvp/spec.md` for domain and data model.

No `serverless`/`sls` command is ever run by an agent — only the dev deploys.

Package manager: pnpm (`pnpm install`, `pnpm test`, `pnpm typecheck`).

## Folder convention

```
src/
  domain/         Entity types (one file per entity), shared across the codebase.
  contracts/       Interfaces (ports) for everything external: gateways (Cognito, Stripe, Gemini, S3, SQS,
                     SNS, clock, id generation, ...) and repositories (DynamoDB access, one per
                     entity/access-pattern group). Only types — no implementation.
  gateways/        Implementations of the gateway contracts above.
    fakes/          In-memory/test implementations of the gateway contracts.
  repositories/    Implementations of the repository contracts above.
    fakes/          In-memory implementations used by use-case tests.
  use-cases/       One directory per use case (e.g. `sign-up-user/`), each exporting a `createXxx(deps)` factory
                     that returns the use-case function. Business logic lives here, not in handlers/controllers.
  controllers/     One class per endpoint (e.g. `auth/signup-controller.ts`), extending the abstract `Controller`.
                     Translates a use case's result into a status code + body using only the generic
                     `ControllerRequest`/`ControllerResponse` shapes — no AWS Lambda or API Gateway types.
  adapters/        Bridges a trigger (`apigwAdapter`, and later `sqsAdapter`, ...) to a `Controller`
                     (or, for queue consumers, whatever intermediary plays that role for that trigger type).
                     Holds all the AWS-event-shape-specific parsing/formatting.
  handlers/        The actual Lambda entry points: wire real gateways/repositories into a use case, wrap it
                     in a controller, pass the controller to the matching adapter. No business logic, no
                     event-shape parsing — both live one layer down (use-cases/ and adapters/, respectively).
```

## Use-case convention

A use case is a factory function that takes its dependencies (repositories/gateways) and returns an async function:

```ts
export function createGetUserById({ userRepository }: { userRepository: UserRepository }) {
  return async function getUserById({ userId }: { userId: string }) {
    return userRepository.findById(userId);
  };
}
```

Tests exercise the returned function through its public input/output, using fake repositories/gateways — never real AWS SDK or Gemini calls. See `src/use-cases/get-user-by-id/` for the reference example (a scaffolding demo, not a real MVP use case — the real ones are listed in the spec's "Arquitetura" section and land with their own tickets).

## Controller/adapter convention

A `Controller` (`src/controllers/controller.ts`) takes a use case in its constructor and exposes `handle(request: ControllerRequest): Promise<ControllerResponse>` — plain objects, no dependency on `aws-lambda` or any other trigger-specific library. It owns request validation and mapping domain errors to status codes.

An adapter (`src/adapters/apigw-adapter.ts` today) takes a `Controller` and returns the actual trigger handler (e.g. `APIGatewayProxyHandlerV2`), translating the trigger's event/response shape to/from `ControllerRequest`/`ControllerResponse`. A future SQS consumer follows the same split — an adapter (`sqsAdapter`) parsing `SQSEvent` records, calling a use case through its own trigger-appropriate intermediary (not a `Controller`, since "request/response" isn't the right shape for a queue message).

A handler (`src/handlers/auth/signup.ts`) is the Lambda entry point referenced by `serverless.yml`: it wires real dependencies into a use case, wraps it in a controller, and passes the controller into the adapter. No business logic, no event parsing — both live one layer down.

See `src/handlers/auth/`, `src/controllers/auth/`, and `src/adapters/apigw-adapter.ts` for the reference implementation.
