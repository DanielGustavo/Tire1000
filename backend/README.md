# Backend

TypeScript on Lambda, deployed with Serverless Framework, single DynamoDB table. See `../CONTEXT.md` and `../.scratch/tire1000-mvp/spec.md` for domain and data model.

No `serverless`/`sls` command is ever run by an agent — only the dev deploys.

Package manager: pnpm (`pnpm install`, `pnpm test`, `pnpm typecheck`).

## Folder convention

```
src/
  domain/         Entity types (one file per entity), shared across the codebase.
  gateways/        Interfaces (ports) to external services (Cognito, Stripe, Gemini, S3, SQS, SNS, clock, id generation, ...).
    fakes/          In-memory/test implementations of the interfaces above.
  repositories/    Interfaces (ports) for DynamoDB access, one per entity/access-pattern group.
    fakes/          In-memory implementations used by use-case tests.
  use-cases/       One directory per use case (e.g. `sign-up-user/`), each exporting a `createXxx(deps)` factory
                     that returns the use-case function. Business logic lives here, not in handlers.
  handlers/        Thin Lambda handlers: parse the event, call a use case (wired with real gateways/repositories), format the response.
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

Handlers stay thin: parse the event, build the use case with real dependencies, call it, format the response. No business logic in handlers.
