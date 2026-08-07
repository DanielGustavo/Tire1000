## Testing

Tests live at the `application/` layer (controllers, use-cases) by default. Skip a dedicated `domain/`/`infra/` unit test unless the logic there is genuinely non-trivial (not a passthrough to a library call, not simple arithmetic verifiable by reading).

## Agent skills

### Issue tracker

Local markdown files under `.scratch/<feature>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Padrão dos cinco papéis canônicos (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `CONTEXT.md` + `docs/adr/` na raiz do repo. See `docs/agents/domain.md`.
