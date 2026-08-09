# Ajustes pós-revisão do passe desktop

Type: task

Blocked by: 08, 09, 10, 11, 13

Status: claimed

## Question

Depois que as tickets 08-13 fecharam o passe desktop completo do map, o usuário revisou o resultado e pediu os ajustes abaixo via `/grill-with-docs`. Sessão de grilling rodada pelo orquestrador (achados de código + `/grilling` de 4 rodadas de decisão real; vários itens eram bugs/reversões óbvias, resolvidos como fato em vez de pergunta). Pedido original do usuário, verbatim:

> pontos de ajuste no DESKTOP:
>   - o header nas telas autenticadas deve ter um max-width (apenas para o conteúdo, é bom que o header em si ocupe a width toda para ter a cor do header preenchendo a tela)
>   - o header no desktop é para ter o botão de creditos também
>   - header deve fica fixo no topo (geral: mobile e desktop)
>
> # homepage
>   - a seção de temas, deve ter um height que ocupe a tela toda
>     - a seção em si fica fixa
>     - seu header fica fixo no topo
>     - o scroll afeta apenas os temas, precisar scrollar a página
>   - adicionar um min-width na seção de temas para não ficar com um width pequeno demais em telas desktop menores
>   - ao trocar de página da listagem de redação, voltar ao topo (no mobile também)
>
> # página de tema
>   - o loading deveria estar centralizado horizontalmente
>   - o bloco "Já finalizou sua redação?" deveria ter posição fixa
>     - no desktop mostrar apenas a opção de upload, com o texto "Fazer upload"
>
> # página de temas
>   - mostrar 9 temas por página
>
> # página de correção
>   - seção de notas deve ter o mesmo comportamento que quero adicionar na seção de temas da homepage
>   - quando um comentário de highlight estiver aberto, ao clicar em quanto canto fora dele deve fechá-lo (no mobile também)

### Achados de fato (sem pergunta, o orquestrador já resolveu por leitura de código)

- **Loading não centralizado em `theme-detail.tsx`**: `Loading` já centraliza seu próprio conteúdo (`items-center`), mas o wrapper pai (`flex flex-col items-start gap-4`, junto do botão Voltar) não tem largura explícita — como o pai do pai também usa `items-start`, a cadeia de larguras "auto" colapsa o wrapper pro tamanho intrínseco do spinner, que fica então alinhado à esquerda em vez de centralizado na coluna do artigo. Fix: `w-full` no wrapper.
- **Highlight não fecha ao clicar fora**: `HighlightedEssayText.tsx` já tem lógica de clique-fora, mas o "fora" é o `<p>` inteiro do texto da redação, não o popup/marca aberta — clicar em qualquer outro trecho de texto dentro do mesmo parágrafo (a maior parte da tela) não fecha. Fix: estreitar o boundary de "fora" pro popup + marca aberta.
- **Botão de créditos desktop**: só remover o `lg:hidden` que a ticket 09 tinha aplicado ao `IconButton` de créditos em `AppLayout.tsx` (decisão revertida agora que o usuário confirmou querer o ícone visível no desktop).
- **Max-width do conteúdo do header**: o `<header>` já ocupa 100% da largura (cor de fundo full-bleed) — só falta capar o conteúdo interno (logo + ícones) em `mx-auto max-w-[1280px]`, mesmo padrão de cap usado nas páginas desde a ticket 08.
- **CTA "Fazer upload" único no desktop**: resolve de quebra o item já sinalizado pela ticket 12 (botão "Tirar foto" disparando prompt real de permissão de webcam no desktop) — escondendo esse botão em `lg:` a inconsistência desaparece.

### Decisões (via `/grilling`, confirmadas pelo usuário)

- **Q1 — Escopo do header fixo**: só o header do `AppLayout` (telas autenticadas: home/themes/theme-detail/essay-result/credits). O header da Landing Page (componente separado, ticket 08) fica como está.
- **Q2 — Semântica de "seção fica fixa"** (aplicada uniformemente a: Temas na Homepage, card de CTA em `theme-detail.tsx`, sidebar de notas em Correção): `position: sticky` (não `fixed`) — gruda logo abaixo do header fixo enquanto a *outra* coluna rola, mas se solta normalmente ao fim do próprio container (nunca sobrepõe o footer). Forma concreta pro caso da Homepage: coluna com `height: calc(100vh - <altura do header>)`, `position: sticky; top: <altura do header>`, título da seção ("Temas"/"Ver todos") fixo no topo da coluna e só a lista de cards rolando por dentro (`overflow-y-auto`) — satisfaz "ocupa a tela toda", "seção fica fixa", "header da seção fica fixo" e "só os temas rolam" ao mesmo tempo, sem edge case de rolagem de página/footer. O card de CTA de `theme-detail.tsx` e a sidebar de notas de Correção recebem o mesmo tratamento sticky+altura (conteúdo curto o suficiente pra raramente precisar do scroll interno — é só pra consistência/robustez se o conteúdo crescer).
- **Q3 — min-width da coluna de Temas na Homepage**: `320px` (reaproveita o único valor de largura de card já existente no código, o `min(320px, calc(100%-32px))` do carrossel mobile).
- **Q4 — "9 temas por página"**: só desktop (mobile continua 3/página, grid 3x3 no Figma = 9). Reage a resize ao vivo via hook de media query (`lg` breakpoint), resetando pra página 1 sempre que a contagem efetiva de itens por página mudar (evita página fora do range após crossing de breakpoint).
- **Scroll-to-top ao trocar de página de "Suas redações"** (Homepage, mobile e desktop): sem pergunta — implementado como scroll da própria seção de volta ao topo da viewport ao chamar `setPage`.

## Answer

_(preenchido pelo orquestrador depois que as 5 frentes de implementação abaixo finalizarem e commitarem)_
