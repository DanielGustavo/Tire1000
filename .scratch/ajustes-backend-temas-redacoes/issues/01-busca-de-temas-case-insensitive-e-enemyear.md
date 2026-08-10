# Busca de temas case-insensitive e filtrando por enemYear/eixo

Type: grilling
Status: resolved

## Question

Tornar a busca de temas (`GET /themes?search=`) case-insensitive, sem denormalizar atributo novo no `Theme`: trocar o `FilterExpression: contains(#title, :search)` do DynamoDB (`backend/src/infra/repositories/dynamo-theme-repository.ts`) por um filtro em memória na camada de aplicação, comparando em minúsculas.

Também fazer o mesmo campo de busca filtrar por `enemYear` (já existe no `Theme`, `backend/src/domain/entities/theme.ts`) e por eixo, sem controle novo: pra cada tema, construir uma string composta `${enemYear ?? 'tire 1000'} | ${theme.title} | ${topic.title}` e checar se ela (em minúsculas) contém o termo de busca (em minúsculas). Decisão do usuário — cobre busca por título, ano do ENEM e nome do eixo, todos pelo mesmo campo de texto, sem parsing de token nem controle de filtro adicional.

## Escopo

- `backend/src/application/use-cases/list-themes/list-themes.ts` e/ou `dynamo-theme-repository.ts` — decidir em qual camada o filtro em memória deve viver. O use-case parece o lugar certo, já que ele já resolve `topic.title` via `themeTopicRepository.findByIds`; o repositório Dynamo não teria essa informação sem uma segunda leitura.
- Remover o `FilterExpression` de busca por texto e o comentário existente sobre case-sensitivity em `dynamo-theme-repository.ts` (o filtro por `topicId` via `GSI1` continua igual, não é afetado).
- Nenhuma mudança de contrato de API esperada (`search` continua uma string livre) — conferir se `frontend/src/pages/themes/` precisa de algum ajuste de copy/placeholder pra indicar que a busca também aceita ano/eixo.
- Testes na camada de use-case (`list-themes.test.ts`), cobrindo case-insensitivity e o novo comportamento por ano/eixo.

## Answer

Implementado como descrito na pergunta, sem desvios:

- **Camada do filtro**: `list-themes.ts` (use-case), confirmando a hipótese do Escopo — o repositório Dynamo não tem `topic.title` disponível sem uma segunda leitura, e o use-case já resolve os tópicos.
- `ListThemesFilter` (contrato + `DynamoThemeRepository` + `InMemoryThemeRepository`) perdeu o campo `search` — o repositório agora só filtra por `topicId`; a busca por texto não existe mais nesse nível.
- `dynamo-theme-repository.ts`: removidos o `FilterExpression: contains(#title, :search)`, o plumbing de `:search` em `ExpressionAttributeValues` e o comentário sobre case-sensitivity.
- `list-themes.ts`: busca todos os temas do escopo (por `topicId`, sem `search`), resolve os tópicos (como já fazia), e só então filtra em memória por `search`, comparando `${theme.enemYear ?? "tire 1000"} | ${theme.title} | ${topic?.title ?? ""}` em minúsculas contra o termo (também em minúsculas). Tema sem tópico resolvido (`topic: null`) não quebra a busca — cai no fallback de string vazia.
- Nenhuma mudança de contrato de API: `ListThemesInput`/`ListThemesController` continuam recebendo `search` como string livre.
- **Copy/placeholder do frontend**: decisão — não mexer. O placeholder atual (`"Buscar tema"`, `frontend/src/pages/themes/themes.tsx`) já é genérico o bastante (não afirma "por título"), e a ticket 08 do mapa Melhorias gerais já garante que `search` vive na query string da URL sem exigir ajuste adicional.
- Testes: 6 novos casos em `list-themes.test.ts` (case-insensitivity, filtro por `enemYear`, fallback `"tire 1000"` para tema sem ano, filtro por eixo/`topic.title`, e busca não quebra com tópico ausente) — 12/12 passando. Suite completa do backend: 173/173, `tsc --noEmit` limpo.
