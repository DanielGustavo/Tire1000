# Textos motivadores: ordem explícita e renderização Markdown

Status: ready-for-agent

## Problem Statement

Ao abrir um tema, os textos motivadores às vezes aparecem fora da ordem em que foram pensados (ex: "Texto motivador 3" antes do "1"), porque a ordem exibida hoje é um acidente de como os IDs (KSUID) são gerados no seed, não um dado real — não existe nenhum campo de ordenação persistido.

Além disso, o conteúdo de cada texto motivador é sempre renderizado como parágrafos simples. Textos que no original têm títulos internos, subtítulos e citações estruturadas (ex: "CAPÍTULO I", artigos de lei enumerados) aparecem como um bloco de texto corrido, sem a hierarquia visual do documento original, dificultando a leitura.

Por fim, o campo `title` que existe hoje na entidade só guarda rótulos genéricos ("Texto motivador 1", "2", "3"), duplicando a posição do item sem agregar informação real.

## Solution

Cada texto motivador passa a ter uma posição explícita (`order`) persistida no banco e usada tanto para ordenar a leitura quanto para codificar a chave de ordenação (SK/GSI2SK), garantindo que a ordem de exibição sempre bata com a ordem pretendida. O campo `title` é removido; o rótulo equivalente ("Texto motivador N") passa a ser calculado no frontend a partir de `order`.

O conteúdo de cada parágrafo de texto passa a ser interpretado como Markdown, permitindo representar títulos internos, subtítulos e listas com a hierarquia visual correta. O conteúdo dos 13 arquivos de seed do ENEM é revisado por completo e reescrito para aproveitar essa capacidade.

## User Stories

1. Como usuário autenticado, quero ver os textos motivadores de um tema na ordem correta de leitura, para acompanhar a sequência pretendida do material.
2. Como usuário autenticado, quero ver um rótulo "Texto motivador N" acima de cada texto, para saber quantos textos existem e em que posição estou.
3. Como usuário autenticado, quero que títulos e subtítulos internos de um texto motivador (ex: "CAPÍTULO I") sejam exibidos com destaque visual (não como parágrafo comum), para escanear a estrutura do texto rapidamente.
4. Como usuário autenticado, quero que listas e enumerações (ex: artigos de lei) dentro de um texto motivador sejam exibidas como lista, para ler conteúdo estruturado facilmente.
5. Como usuário autenticado, quero que imagens intercaladas em um texto motivador continuem aparecendo na posição correta em relação aos parágrafos de texto, para não perder o contexto entre imagem e texto.
6. Como operador da plataforma (curador de conteúdo), quero definir a ordem dos textos motivadores de um tema simplesmente pela ordem em que os listo no JSON de seed, para não ter que gerenciar um campo de ordenação manual redundante.
7. Como operador da plataforma, quero que a ordem persistida no banco (SK/GSI2SK) reflita essa ordem de forma confiável, para que a API sempre devolva os textos motivadores na ordem correta independentemente de quando cada item foi criado.
8. Como operador da plataforma, quero escrever o conteúdo de um texto motivador usando sintaxe Markdown (cabeçalhos, listas, negrito), para representar fielmente a estrutura do texto original do ENEM.
9. Como operador da plataforma, quero reescrever os 13 arquivos de seed existentes para usar Markdown onde apropriado, para que o conteúdo já publicado também ganhe a formatação correta.
10. Como operador da plataforma, quero apagar os dados atuais de Topics/Themes/ReferenceTexts e rodar o seed novamente do zero, para aplicar a nova estrutura de dados sem precisar de uma migração incremental, já que o produto ainda não está em produção com usuários reais.
11. Como desenvolvedor, quero que o campo `title` seja removido da entidade `ReferenceText` e do contrato da API, para eliminar o dado redundante e a fonte de confusão.
12. Como desenvolvedor, quero que a query GSI2 usada por `GetTheme` devolva os textos motivadores já ordenados por `order` (via SK), para não precisar reordenar em memória na camada de aplicação.
13. Como desenvolvedor, quero que o fake de repositório em memória usado nos testes reflita esse mesmo comportamento de ordenação, para que os testes continuem sendo um proxy confiável do comportamento real do DynamoDB.
14. Como desenvolvedor, quero que o Markdown renderizado no frontend não use `dangerouslySetInnerHTML` nem introduza risco de XSS, para manter o padrão de segurança já usado no restante do frontend.
15. Como desenvolvedor, quero que a estrutura de heading do Markdown renderizado (`##`, `###`) fique visualmente subordinada ao rótulo "Texto motivador N" e não introduza cores/tokens novos, para manter consistência com o design system existente.
16. Como desenvolvedor, quero que o script de seed continue sendo a única via de escrita de `ReferenceText` (sem endpoint de criação/edição), para não expandir o escopo desta mudança para um CRUD que o produto não precisa hoje.

## Implementation Decisions

### Domain e DynamoDB

- `ReferenceText`: remove a prop `title`; adiciona `order: number` (inteiro, zero-based, único dentro de um `themeId`).
- SK da tabela principal e `GSI2SK` passam a ser `REFERENCE_TEXT#<order com zero-padding de 2 dígitos>#<id>` (hoje ambos são só `REFERENCE_TEXT#<id>`, sem nenhum componente de ordenação — essa é a causa raiz do bug de ordem, já que a query GSI2 usada por `DynamoThemeRepository.findById` devolve os itens na ordem lexicográfica do `GSI2SK`). Padding fixo em 2 dígitos (suporta até 99 textos motivadores por tema). `PK`/`GSI2PK` não mudam.
- `DynamoThemeRepository.findById`: a `ProjectionExpression`/`ExpressionAttributeNames` da query passam a projetar `order` no lugar de `title`.
- `ReferenceTextDTO`: remove `title`, adiciona `order: number`. Não existe (e não é introduzido agora) schema zod para essa entidade — segue write-only via seed script, sem endpoint de criação/edição.
- `InMemoryThemeRepository.findById` (fake usado nos testes): passa a ordenar os `referenceTexts` retornados por `order` ascendente, espelhando o comportamento real da GSI2 orientado por SK.

### Seed

- `EnemReferenceTextJson` (tipo usado pelo script de seed): remove `title`; não ganha um campo `order` explícito no JSON — `order` é atribuído pelo script como o índice (zero-based) de cada entrada dentro do array `referenceTexts` do tema no JSON.
- Os 13 arquivos em `backend/scripts/seed-data/enem-temas/` são reescritos por completo (não só os casos já identificados): remoção da chave `title`; strings de `content` de parágrafos `TEXT` reescritas em Markdown (`##`/`###` para títulos/subtítulos internos, listas para enumerações como artigos de lei) onde o documento original do ENEM tinha essa estrutura. `#`/heading de nível 1 não é usado — fica reservado conceitualmente para o rótulo "Texto motivador N", que não é markdown.
- Migração: como não há endpoint de escrita para `ReferenceText` e o produto está pré-lançamento, a migração é um wipe completo de todos os itens `TOPIC`/`THEME`/`REFERENCE_TEXT` na tabela alvo seguido de um rerun do `seed-themes.ts` (já atualizado) sem modificações adicionais no script além das descritas acima. Isso regenera os IDs de Topics, Themes e ReferenceTexts — aceitável pré-lançamento, já que não há URLs de tema/eixo em uso por usuários reais. Tornar `seed-themes.ts` idempotente/seguro para rerun fica fora de escopo (ver Further Notes).

### Frontend

- `ReferenceText` (tipo em `theme-service.ts`): remove `title`, adiciona `order: number`.
- `theme-detail.tsx`: o `<h2>{referenceText.title}</h2>` é substituído por um rótulo computado `` `Texto motivador ${order + 1}` `` — nenhuma string é persistida para isso, é calculado no render a partir de `order`.
- Cada parágrafo `TEXT` passa a ser renderizado via `react-markdown` (sem plugins — sem `remark-gfm`, tabelas ficam fora de escopo) no lugar do `<p>` atual.
- Mapeamento de heading: `##` renderiza equivalente a h3, `###` equivalente a h4, estilizados com as classes de cor neutra já usadas no corpo do texto — nenhum token de cor novo é introduzido.
- Renderização de parágrafos `IMAGE` não muda.

## Testing Decisions

- Bom teste aqui = testar o comportamento externo (o shape/ordem que `GetTheme` devolve), não a string exata da SK/GSI2SK.
- Seam principal: estender `backend/src/application/use-cases/get-theme/get-theme.test.ts` (já é o teste existente para essa entidade, camada de aplicação):
  - Semear `referenceTexts` fora da ordem pretendida no fixture e afirmar que o retorno de `GetTheme` vem ordenado por `order`.
  - Atualizar fixtures/assertions: remover `title`, adicionar `order`, batendo com o novo shape do DTO.
- Atualizar `InMemoryThemeRepository.findById` para ordenar por `order`, mantendo o teste como um proxy fiel do comportamento real da GSI2.
- Sem teste dedicado para as funções de montagem de SK/GSI2SK (`referenceTextSK`/`referenceTextGSI2SK`) — é padding/concatenação de string, "aritmética simples verificável lendo o código" pela convenção de teste deste repo (`CLAUDE.md`), e nenhum outro item mapper do projeto tem teste dedicado.
- Sem teste para o script de migração/reseed nem para as mudanças em `seed-themes.ts` — operação manual, rodada por um desenvolvedor, sem contrato de camada de aplicação pra testar, mesmo padrão de hoje.
- Sem teste automatizado de frontend — o frontend não tem nenhuma infraestrutura de teste hoje (zero `vitest`/RTL, zero arquivo `*.test.tsx`); introduzi-la é escopo maior que essa feature. Verificação por QA manual da tela de detalhe do tema (mobile, variantes com e sem crédito) depois da implementação.

## Out of Scope

- Tornar `seed-themes.ts` idempotente/seguro para rodar mais de uma vez sem duplicar dados (issue conhecida, ver Further Notes).
- `remark-gfm`/tabelas em Markdown — tabelas hoje entram como imagem; pode ser revisitado se aparecer conteúdo genuinamente tabular em texto.
- Qualquer endpoint de criação/edição ou schema zod para `ReferenceText` — continua write-only via seed script.
- Introduzir tooling de teste no frontend (vitest/RTL).
- Mudanças no campo `font` (crédito/fonte) ou no modelo de parágrafos `IMAGE`.
- Coordenação de sequência de deploy (backend antes do frontend) — sem tráfego real pré-lançamento, não é uma preocupação aqui.

## Further Notes

- A exploração que embasou este spec encontrou que `title` nunca esteve de fato embutido na SK/GSI2SK — a SK de hoje já é só `REFERENCE_TEXT#<id>`, e a "ordem" atual é um acidente da geração k-sortable/cronológica do KSUID combinada com a ordem de inserção no seed. Essa é a causa raiz do bug de ordem reportado.
- `seed-themes.ts` gera KSUIDs aleatórios novos para Topics, Themes e ReferenceTexts a cada execução, sem nenhum passo de delete/upsert — ou seja, hoje só é seguro rodá-lo uma vez contra uma tabela vazia. A estratégia de migração deste spec (wipe completo + rerun) trabalha dentro dessa limitação existente em vez de corrigi-la.
- Vocabulário de domínio (`CONTEXT.md`): "Texto motivador" = entidade `ReferenceText`; "Fonte" = o campo `font` (crédito/origem, não tipografia) — não afetado por este spec, mas relevante para quem for ler os arquivos tocados.
