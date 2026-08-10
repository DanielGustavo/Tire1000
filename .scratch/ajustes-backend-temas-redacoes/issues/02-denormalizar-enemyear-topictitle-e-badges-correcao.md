# Denormalizar enemYear/topicTitle no Essay e badges na Correção

Type: grilling
Status: resolved

## Question

Denormalizar `enemYear` (do `Theme`) e `topicTitle` (do `ThemeTopic`) no `Essay`, no mesmo padrão já usado por `themeTitle`/`topicColor` (`backend/src/domain/entities/essay.ts`, resolvidos uma única vez em `backend/src/application/use-cases/upload-essay/upload-essay.ts`, que já busca `Theme` e `ThemeTopic` na criação) — campos soltos no nível raiz, não um objeto aninhado.

Redações já existentes ficam sem esses campos (histórico não migrado, decisão do usuário) — `enemYear`/`topicTitle` devem ser opcionais em `EssayDTO`/tipos relacionados, e a UI trata a ausência escondendo a badge, nunca quebrando.

Com esse dado disponível, fechar o gap que a [ticket 07 do mapa Frontend do zero a partir do Figma](../../frontend-redesign/issues/07-correcao-resultado.md) deixou pendente (o usuário tinha optado por simplificar sem badges por falta do dado): adicionar as badges de "ENEM {ano}" e eixo no header de `frontend/src/pages/essay-result/essay-result.tsx`, reaproveitando `components/ThemeBadges.tsx` (já usado em `theme-detail.tsx` desde a ticket 05 do mesmo mapa).

## Escopo

- Backend: `backend/src/domain/entities/essay.ts` (`EssayProps`/`NewEssayProps`), `backend/src/infra/db/dynamodb/items/essay-item.ts`, `backend/src/application/dtos/essay-dto.ts` (`toEssayDTO`/`toEssayDetailDTO`), `backend/src/application/use-cases/upload-essay/upload-essay.ts`.
- Frontend: `frontend/src/pages/essay-result/essay-result.tsx` — badges no header, condicionadas à presença de `enemYear`/`topicTitle` (redações antigas sem o dado não mostram a badge).
- Conferir se `EssayCard`/outros consumidores de `EssayDTO` na Home precisam do mesmo tratamento (a ticket 03 do mapa Frontend do zero a partir do Figma já tinha decidido não mostrar essas badges lá — confirmar que isso não muda antes de mexer).
- Testes na camada de use-case (`upload-essay.test.ts`) cobrindo os novos campos denormalizados.

## Answer

Implementado como descrito, com uma decisão de execução para a ambiguidade de "ausência" do dado:

- **Backend**: `essay.ts` (`EssayProps`/`NewEssayProps`/classe), `essay-item.ts` (`EssayItem`, `toEssayItem`, `fromEssayItem` com fallback `?? null` pra itens legados sem o atributo), `essay-dto.ts` (`EssayDTO`, `toEssayDTO`), `upload-essay.ts` (passa `themeResult.theme.enemYear` e `topic.title` pro `Essay.create`), e o fake `in-memory-essay-repository.ts` (`cloneEssay`). Campos soltos no nível raiz, como pedido — não um objeto aninhado.
- **Semântica de nulidade** (decisão de execução, não uma nova pergunta em aberto — já coberta pela decisão do usuário de não migrar histórico, registrada em Out of scope do mapa): `topicTitle: string | null` é o único sinal de "esta redação não tem o dado denormalizado" (`null` só acontece em redações criadas antes desta mudança — toda redação nova sempre resolve um tópico). `enemYear: number | null` continua podendo ser `null` legitimamente mesmo em redação nova, quando o tema não tem ano do ENEM — mesma semântica que `Theme.enemYear` já tinha. A UI usa a presença de `topicTitle` como gate único pra mostrar as duas badges juntas (nunca uma só).
- **Frontend**: `types/essay.ts` ganhou os 2 campos. `ThemeBadges.tsx` teve seu tipo de props estreitado de `ThemeWithTopic` (que exigia `Theme`/`ThemeTopic` completos, com `id`/`topicId`) pra um shape mínimo (`theme: { enemYear }`, `topic: { title, color } | null`) — só o que o componente já usava — permitindo que `essayResult.tsx` monte o objeto a partir do `EssayDTO` sem IDs fantasma. Mudança compatível com os usos existentes (`ThemeListItem`, `themeDetail.tsx`), que continuam passando `Theme`/`ThemeTopic` completos (typing estrutural). Badges renderizadas no header de `essayResult.tsx`, acima do título, gated por `essay.topicTitle`.
- **`EssayCard` (Home)**: confirmado — a ticket 03 do mapa Frontend do zero a partir do Figma nunca adicionou badges de ENEM/eixo lá (só título, data e nota); nada mudou.
- Testes: `upload-essay.test.ts` (2 casos: denormalização feliz + `enemYear: null` quando o tema não tem ano), `get-essay-detail.test.ts`/`list-user-essays.test.ts`/os 2 testes de controller correspondentes atualizados pra incluir os novos campos no DTO esperado, `list-user-essays.test.ts` ganhou um caso cobrindo o passthrough de `null`/`null` (redação legada). `enqueue-essay-validation`/`evaluate-essay`/`resend-essay`/`validate-essay` (não relacionados a este dado) só tiveram os `buildEssay` helpers atualizados com `enemYear: null, topicTitle: null` pra satisfazer o tipo. Backend: 175/175 passando, `tsc --noEmit` limpo. Frontend: `tsc -b` limpo, `oxlint` sem warnings novos.
- **Não verificado visualmente no browser**: a badge só aparece com uma redação real avaliada (pipeline completo de upload → Revisão → Avaliação, contra DynamoDB/S3/Gemini reais) — não há infra local (`serverless-offline`/DynamoDB local) pra simular isso nesta sessão. A lógica foi conferida por leitura + typecheck e replica o padrão já em produção em `themeDetail.tsx`.
