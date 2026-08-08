# 02 — Seed: script deriva `order` da posição no array

**What to build:** `seed-themes.ts` passa a construir cada `ReferenceText` no novo modelo baseado em `order` — `order` é atribuído automaticamente pela posição de cada entrada dentro do array `referenceTexts` do tema no JSON, sem consumir mais nenhum campo `title`.

**Blocked by:** 01 — Backend: `order` substitui `title`, ordenação correta ponta a ponta

**Status:** ready-for-agent

- [ ] `EnemReferenceTextJson` (tipo usado pelo script): remove `title`.
- [ ] Script atribui `order` = índice zero-based dentro do array `referenceTexts` do tema, ao montar cada chamada `ReferenceText.reconstitute(...)`.
- [ ] Script continua compilando e rodando sem erros contra uma tabela local/dynamodb-local (verificado localmente, não contra a tabela real).
