# Ajustes de backend em temas e redações

## Destination

Três ajustes independentes de backend (com consumo de frontend onde a mudança afeta a UI), sobre temas e redações:

1. Busca de temas (`GET /themes?search=`) fica case-insensitive e passa a filtrar por `enemYear` pelo mesmo campo de texto, sem controle novo.
2. `Essay` denormaliza `enemYear`/`topicTitle` na criação (mesmo padrão de `themeTitle`/`topicColor` já existente) — fecha o gap que a ticket 07 do mapa [Frontend do zero a partir do Figma](../frontend-redesign/map.md) tinha deixado pendente, e a tela de Correção ganha as badges de "ENEM {ano}"/eixo que ficaram de fora naquela ticket.
3. A listagem de "Suas redações" passa a paginar pelo backend via cursor do DynamoDB, trocando a paginação numérica client-side por Anterior/Próxima.

Destino alcançado quando as 3 mudanças acima estiverem implementadas e mergeadas.

## Notes

- **Exceção às normas padrão do Wayfinder**: este mapa carrega execução, não só decisão — mesmo padrão do mapa [Frontend do zero a partir do Figma](../frontend-redesign/map.md) e do esforço [Melhorias gerais da plataforma](../melhorias-gerais/spec.md). Cada ticket entrega código mergeado.
- Vocabulário do domínio em `CONTEXT.md` (Tema = `Theme`, Eixo = `ThemeTopic`). Contrato de API e casos de uso já implementados: `.scratch/tire1000-mvp/spec.md`.
- Convenção de teste deste repo (`CLAUDE.md`): testes vivem na camada de application (use-cases/controllers) — pular teste dedicado de `domain/`/`infra/` a menos que a lógica seja genuinamente não-trivial.
- Este mapa reabre 2 decisões já registradas em outros lugares: a ticket 07 do mapa Frontend do zero a partir do Figma (badges de ENEM/eixo na Correção, adiadas por falta do dado) e o item "Paginação/rate limiting de API" listado como fora de escopo naquele mesmo mapa — especificamente pra redações; paginação de temas continua fora de escopo aqui (não foi pedida).
- A ticket 08 do esforço Melhorias gerais já move `search`/`topicId`/`page` de temas pra query string da URL — ao resolver a ticket de busca deste mapa, conferir se isso precisa de algum ajuste.
- Sempre invocar `/grilling` e `/domain-modeling` quando a resolução de uma ticket envolver decisão de comportamento não coberta pelas Notes ou pela pergunta da própria ticket.

## Decisions so far

- [Busca de temas case-insensitive e filtrando por enemYear/eixo](issues/01-busca-de-temas-case-insensitive-e-enemyear.md) — filtro em memória no use-case `list-themes.ts` (não no repositório), comparando `${enemYear ?? "tire 1000"} | title | topic.title` em minúsculas; `search` sai do contrato do repositório; placeholder do frontend mantido sem alteração.
- [Denormalizar enemYear/topicTitle no Essay e badges na Correção](issues/02-denormalizar-enemyear-topictitle-e-badges-correcao.md) — campos soltos em `Essay`/`EssayDTO`; `topicTitle: null` é o único gate de "redação legada sem o dado" (enemYear pode ser `null` legitimamente mesmo em redação nova); `ThemeBadges.tsx` teve o tipo de props estreitado pra reuso sem IDs fantasma; badges renderizadas em `essayResult.tsx`; `EssayCard` (Home) confirmado sem mudança.
- [Paginação de redações pelo backend](issues/03-paginacao-de-redacoes-pelo-backend.md) — cursor via query param `cursor` (base64 do `LastEvaluatedKey`, `Limit: 5` hardcoded); "Anterior" é uma pilha de cursors no cliente, não paginação bidirecional no backend; resposta `{ essays, nextCursor }` (`nextCursor` ausente na última página); cursor malformado → 400. Novo componente `EssaysPagination` (Anterior/Próxima) substitui a `Pagination` numérica só nesta seção.

## Not yet specified

(nenhuma — as 3 mudanças do destino estão implementadas)

## Out of scope

- Paginação de temas pelo backend — só a de redações foi pedida; Temas continua com paginação client-side (ver [Frontend do zero a partir do Figma](../frontend-redesign/map.md), ticket 04).
- Migração retroativa de `enemYear`/`topicTitle` pras redações já existentes — decisão do usuário foi deixar nulo/ausente no histórico, tratado como opcional em `EssayDTO`.
- Atributo denormalizado (`titleLower`) no `Theme` pra busca case-insensitive — descartado em favor de filtro em memória na aplicação, sem migração.
