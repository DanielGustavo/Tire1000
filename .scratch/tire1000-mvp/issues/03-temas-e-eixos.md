# 03 — Temas e eixos (leitura)

**What to build:** Usuário autenticado navega os temas de redação disponíveis — lista ordenada por data de publicação, filtro por eixo, busca por título, detalhe com textos motivadores — e lista os eixos existentes. Cadastro de temas/eixos continua manual, direto no banco (sem API de escrita neste MVP).

**Blocked by:** 01 — Scaffolding do projeto, 02 — Cadastro e login

**Status:** ready-for-human

- [x] `GET /themes` lista temas ordenados pela data de publicação (`enemYear` ou `createdAt`, conforme ADR-0003)
- [x] `GET /themes` suporta filtro por eixo (`topicId`) e busca por título
- [x] `GET /themes/{themeId}` retorna o tema com seus textos motivadores (`ReferenceText`)
- [x] `GET /topics` lista os eixos
- [x] Fixtures/seed de temas e eixos para desenvolvimento e testes locais
- [x] Testes Vitest dos casos de uso `ListThemes`/`GetTheme`/`ListTopics` com fake repository
- [x] Telas de listagem e detalhe de tema no front
- [x] `GET /themes` e `GET /themes/{themeId}` também devolvem o eixo (`ThemeTopic`: título/cor) — `BatchGetItem` na listagem, `GetItem` no detalhe, sem denormalizar (ver ADR-0004)

## Comments

Incongruência encontrada durante a implementação: o modelo de dados original não previa como buscar o eixo (`ThemeTopic`) de um Theme sem uma terceira leitura. Cogitamos denormalizar `topicTitle`/`topicColor` no item Theme e também colocar `ThemeTopic` no GSI2 compartilhado com Theme/ReferenceText — descartamos as duas (a segunda esbarra em `ThemeTopic` ser reaproveitado por vários Themes, não dá pra fixar `GSI2PK = THEME#<themeId>` num item só sem duplicá-lo). Decisão: resolver o eixo com uma leitura separada em runtime (ver ADR-0004).
