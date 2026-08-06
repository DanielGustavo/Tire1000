# 03 — Temas e eixos (leitura)

**What to build:** Usuário autenticado navega os temas de redação disponíveis — lista ordenada por data de publicação, filtro por eixo, busca por título, detalhe com textos motivadores — e lista os eixos existentes. Cadastro de temas/eixos continua manual, direto no banco (sem API de escrita neste MVP).

**Blocked by:** 01 — Scaffolding do projeto, 02 — Cadastro e login

**Status:** ready-for-agent

- [ ] `GET /themes` lista temas ordenados pela data de publicação (`enemYear` ou `createdAt`, conforme ADR-0003)
- [ ] `GET /themes` suporta filtro por eixo (`topicId`) e busca por título
- [ ] `GET /themes/{themeId}` retorna o tema com seus textos motivadores (`ReferenceText`)
- [ ] `GET /topics` lista os eixos
- [ ] Fixtures/seed de temas e eixos para desenvolvimento e testes locais
- [ ] Testes Vitest dos casos de uso `ListThemes`/`GetTheme`/`ListTopics` com fake repository
- [ ] Telas de listagem e detalhe de tema no front
