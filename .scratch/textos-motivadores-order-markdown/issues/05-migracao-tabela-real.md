# 05 — Migração: wipe & reseed da tabela real

**What to build:** a tabela DynamoDB real (dev/prod) é repopulada com a nova estrutura de SK baseada em `order` e o conteúdo Markdown reescrito, para que a API/frontend em produção reflitam tudo isso ponta a ponta.

**Blocked by:** 03 — Seed: reescrita completa em Markdown (13 anos do ENEM)

**Status:** ready-for-human

- [ ] Todos os itens `TOPIC`/`THEME`/`REFERENCE_TEXT` apagados da tabela alvo.
- [ ] `seed-themes.ts` rodado novamente contra a tabela alvo (`TABLE_NAME=... pnpm seed:themes`).
- [ ] Tela de detalhe do tema checada manualmente contra a tabela real/deployada, confirmando ordem correta e renderização Markdown.
