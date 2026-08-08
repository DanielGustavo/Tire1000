# 01 — Backend: `order` substitui `title`, ordenação correta ponta a ponta

**What to build:** `GetTheme` (e por extensão a API) passa a devolver os textos motivadores de um tema com um campo `order` no lugar de `title`, corretamente ordenados por `order` independentemente da ordem de inserção no banco. Essa é a mudança de camada de dados sobre a qual tudo mais deste feature é construído.

**Blocked by:** None — can start immediately

**Status:** ready-for-agent

- [ ] `ReferenceText` (entidade/props): remove `title`, adiciona `order: number`.
- [ ] Item mapper do DynamoDB: SK e `GSI2SK` passam a codificar `REFERENCE_TEXT#<order com zero-padding de 2 dígitos>#<id>`.
- [ ] `DynamoThemeRepository.findById`: a query GSI2 projeta `order` no lugar de `title`.
- [ ] `ReferenceTextDTO`/`toReferenceTextDTO`: remove `title`, adiciona `order`.
- [ ] `InMemoryThemeRepository.findById`: ordena os `referenceTexts` retornados por `order` ascendente.
- [ ] `get-theme.test.ts`: fixtures/assertions passam a usar `order` em vez de `title`; novo teste com fixtures semeadas fora de ordem, afirmando que o retorno vem ordenado por `order`.
