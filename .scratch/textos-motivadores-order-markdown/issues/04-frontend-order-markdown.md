# 04 — Frontend: rótulo por `order` + renderização Markdown

**What to build:** a tela de detalhe do tema (mobile) mostra cada texto motivador com um rótulo "Texto motivador N" calculado a partir de `order`, e renderiza o conteúdo de cada parágrafo de texto como Markdown em vez de texto simples.

**Blocked by:** 01 — Backend: `order` substitui `title`, ordenação correta ponta a ponta

**Status:** ready-for-agent

- [x] Tipo `ReferenceText` em `theme-service.ts`: remove `title`, adiciona `order: number`.
- [x] `theme-detail.tsx`: heading substituído por um rótulo calculado como `Texto motivador ${order + 1}`, sem nenhuma string persistida para isso.
- [x] `react-markdown` adicionado como dependência e usado para renderizar o `content` de cada parágrafo `TEXT`.
- [x] Markdown `##` renderiza visualmente equivalente a h3, `###` equivalente a h4, estilizados com as classes de cor neutra já existentes — nenhum token de cor novo.
- [x] Renderização de parágrafos `IMAGE` não muda.
- [ ] Verificado manualmente no navegador (variantes com e sem crédito da tela de detalhe do tema).

## Comments

Implementado em `8923765`. `pnpm build` limpo. O último item (QA manual no navegador) **ainda não foi feito**: o agente que implementou não tinha credenciais Cognito nem um backend local pra carregar dados reais (a API do app aponta pra um ambiente real deployado, que devolveu 401). Verificação ficou limitada a leitura cuidadosa do JSX + typecheck/build. Fica pendente rodar essa verificação manual (idealmente depois da ticket 05, quando a tabela real tiver os dados novos).
