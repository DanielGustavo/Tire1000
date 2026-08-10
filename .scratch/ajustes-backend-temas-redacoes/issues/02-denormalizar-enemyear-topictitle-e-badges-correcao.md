# Denormalizar enemYear/topicTitle no Essay e badges na Correção

Type: grilling

## Question

Denormalizar `enemYear` (do `Theme`) e `topicTitle` (do `ThemeTopic`) no `Essay`, no mesmo padrão já usado por `themeTitle`/`topicColor` (`backend/src/domain/entities/essay.ts`, resolvidos uma única vez em `backend/src/application/use-cases/upload-essay/upload-essay.ts`, que já busca `Theme` e `ThemeTopic` na criação) — campos soltos no nível raiz, não um objeto aninhado.

Redações já existentes ficam sem esses campos (histórico não migrado, decisão do usuário) — `enemYear`/`topicTitle` devem ser opcionais em `EssayDTO`/tipos relacionados, e a UI trata a ausência escondendo a badge, nunca quebrando.

Com esse dado disponível, fechar o gap que a [ticket 07 do mapa Frontend do zero a partir do Figma](../../frontend-redesign/issues/07-correcao-resultado.md) deixou pendente (o usuário tinha optado por simplificar sem badges por falta do dado): adicionar as badges de "ENEM {ano}" e eixo no header de `frontend/src/pages/essay-result/essay-result.tsx`, reaproveitando `components/ThemeBadges.tsx` (já usado em `theme-detail.tsx` desde a ticket 05 do mesmo mapa).

## Escopo

- Backend: `backend/src/domain/entities/essay.ts` (`EssayProps`/`NewEssayProps`), `backend/src/infra/db/dynamodb/items/essay-item.ts`, `backend/src/application/dtos/essay-dto.ts` (`toEssayDTO`/`toEssayDetailDTO`), `backend/src/application/use-cases/upload-essay/upload-essay.ts`.
- Frontend: `frontend/src/pages/essay-result/essay-result.tsx` — badges no header, condicionadas à presença de `enemYear`/`topicTitle` (redações antigas sem o dado não mostram a badge).
- Conferir se `EssayCard`/outros consumidores de `EssayDTO` na Home precisam do mesmo tratamento (a ticket 03 do mapa Frontend do zero a partir do Figma já tinha decidido não mostrar essas badges lá — confirmar que isso não muda antes de mexer).
- Testes na camada de use-case (`upload-essay.test.ts`) cobrindo os novos campos denormalizados.
