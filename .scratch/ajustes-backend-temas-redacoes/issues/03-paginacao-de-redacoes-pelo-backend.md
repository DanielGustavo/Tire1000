# Paginação de redações pelo backend

Type: grilling
Status: resolved

## Question

Paginar `GET /essays` pelo backend via cursor do DynamoDB (`Limit` + `ExclusiveStartKey`/`LastEvaluatedKey`, codificado em base64 como `nextCursor`) — `backend/src/application/use-cases/list-user-essays/list-user-essays.ts`, `backend/src/domain/contracts/repositories/essay-repository.ts`, `backend/src/infra/repositories/dynamo-essay-repository.ts` (`listByUserId`, hoje um único `Query` sem `Limit`).

Não há convenção de paginação por cursor em nenhum outro lugar do backend hoje — esta ticket estabelece o padrão (nome do query param, formato do cursor, shape da resposta, ex. `{ essays, nextCursor }`).

No frontend, `frontend/src/pages/home/hooks/useEssaysSection.ts` deixa de buscar todas as redações de uma vez e fatiar client-side (`ESSAYS_PER_PAGE`) — passa a pedir uma página por vez ao backend. A UI troca os números de página de `components/Pagination.tsx` por botões simples de "Anterior"/"Próxima" nesta seção (decisão do usuário — Temas continua com a paginação numérica client-side existente, fora de escopo aqui).

**Decisão em aberto a fechar durante a resolução desta ticket**: como suportar "Anterior" (DynamoDB só pagina pra frente nativamente via `LastEvaluatedKey`) — cursor bidirecional real no backend vs. uma pilha de cursors já visitados guardada no cliente (mais simples, suficiente já que a navegação nesta UI é sempre sequencial a partir da primeira página).

## Escopo

- Backend: use-case, contrato de repositório, implementação Dynamo, controller de listagem de redações.
- Frontend: `useEssaysSection.ts` e o componente de paginação da seção "Suas redações" na Home.
- Testes na camada de use-case/controller cobrindo `Limit`/cursor.

## Answer

Grillado (ver transcript da sessão) e implementado. Decisões:

- **"Anterior"**: pilha de cursors guardada no cliente (`useEssaysSection`), não paginação bidirecional no backend — navegação nesta UI é sempre sequencial a partir da primeira página, sem deep-link pra uma página específica.
- **Query param**: `cursor` (string opaca).
- **Tamanho de página**: hardcoded no use-case (`ESSAYS_PAGE_SIZE = 5`, mesmo valor do antigo `ESSAYS_PER_PAGE` client-side) — sem `limit` configurável, único consumidor hoje.
- **Formato do cursor**: base64 do JSON do `LastEvaluatedKey` do Dynamo (`{ PK, SK }` = `USER#<userId>`/`ESSAY#<essayId>`, nada sensível), sem assinatura/criptografia. Cursor malformado → `400 Bad Request` (`BadRequestError`), já que só chega assim por manipulação direta da query string.
- **Shape da resposta**: `{ essays, nextCursor }`, com `nextCursor` **ausente** (não `null`) na última página.
- **Polling de status** (`useEssays`'s `refetchInterval`): passa a valer só pra página atualmente visível (cada página é uma query própria, `["essays", cursor]`) — aceito como trade-off; lista é mais-recente-primeiro, então o caso comum (essay recém-enviada, ainda pendente) já cai na página 1.

Implementação:

- Backend: `EssayRepository#listByUserId` agora recebe `{ limit, cursor }` e retorna `{ essays, nextCursor }` (contrato, `DynamoEssayRepository`, `InMemoryEssayRepository`). Novo helper `infra/db/dynamodb/cursor.ts` (encode/decode, com teste dedicado — lógica não-trivial). Use-case e controller de `list-user-essays` repassam `cursor` de ponta a ponta.
- Frontend: `essayService.list({ cursor })`, `useEssays(cursor)` com `queryKey: ["essays", cursor ?? null]`, `useEssaysSection` trocado pra pilha de cursors, novo componente `EssaysPagination` (Anterior/Próxima simples, sem números — `components/Pagination.tsx` numérico segue intocado, ainda usado por Temas).
- `backend/insomnia.json` atualizado com o parâmetro `cursor` em "List Essays".
- Testes: 181 testes de backend passando (novos casos de paginação/cursor no use-case, controller e no helper de cursor). Frontend: `tsc -b`, `oxlint` e `vite build` limpos.
- **Não verificado em navegador com backend real**: este repo não tem DynamoDB local nem mock do backend pro frontend, e o Serverless só roda por comando do usuário — a verificação ficou nos testes automatizados e no build, não numa sessão real no app.
