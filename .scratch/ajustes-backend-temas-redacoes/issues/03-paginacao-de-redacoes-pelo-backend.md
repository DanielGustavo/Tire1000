# Paginação de redações pelo backend

Type: grilling

## Question

Paginar `GET /essays` pelo backend via cursor do DynamoDB (`Limit` + `ExclusiveStartKey`/`LastEvaluatedKey`, codificado em base64 como `nextCursor`) — `backend/src/application/use-cases/list-user-essays/list-user-essays.ts`, `backend/src/domain/contracts/repositories/essay-repository.ts`, `backend/src/infra/repositories/dynamo-essay-repository.ts` (`listByUserId`, hoje um único `Query` sem `Limit`).

Não há convenção de paginação por cursor em nenhum outro lugar do backend hoje — esta ticket estabelece o padrão (nome do query param, formato do cursor, shape da resposta, ex. `{ essays, nextCursor }`).

No frontend, `frontend/src/pages/home/hooks/useEssaysSection.ts` deixa de buscar todas as redações de uma vez e fatiar client-side (`ESSAYS_PER_PAGE`) — passa a pedir uma página por vez ao backend. A UI troca os números de página de `components/Pagination.tsx` por botões simples de "Anterior"/"Próxima" nesta seção (decisão do usuário — Temas continua com a paginação numérica client-side existente, fora de escopo aqui).

**Decisão em aberto a fechar durante a resolução desta ticket**: como suportar "Anterior" (DynamoDB só pagina pra frente nativamente via `LastEvaluatedKey`) — cursor bidirecional real no backend vs. uma pilha de cursors já visitados guardada no cliente (mais simples, suficiente já que a navegação nesta UI é sempre sequencial a partir da primeira página).

## Escopo

- Backend: use-case, contrato de repositório, implementação Dynamo, controller de listagem de redações.
- Frontend: `useEssaysSection.ts` e o componente de paginação da seção "Suas redações" na Home.
- Testes na camada de use-case/controller cobrindo `Limit`/cursor.
