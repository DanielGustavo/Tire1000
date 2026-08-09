# Homepage: temas em destaque + Suas redações (desktop)

Status: resolved

Type: prototype

Blocked by: 03

## Question

Adaptar a Homepage construída na ticket "Homepage: temas em destaque + Suas redações (mobile)" para desktop, usando os frames "Homepage" (nó `195:599`) e "Homepage empty" (nó `195:1054`) do canvas Desktop (`106:1830`), e "User menu" (`195:391`) como referência do dropdown de usuário em telas largas.

## Answer

Adaptado `frontend/src/pages/home/{home.tsx,components/{ThemesSection,ThemeCard,EssaysSection}.tsx}` + `frontend/src/layouts/AppLayout.tsx` (Header/UserMenu, compartilhado entre páginas) pro breakpoint `lg:` (1024px, mesmo definido na ticket 08).

**Layout de 2 colunas**: `home.tsx` passou a envolver `ThemesSection`+`EssaysSection` num único `div` (antes um Fragment) com `lg:flex-row-reverse` — mantém a ordem do DOM igual ao mobile (Temas primeiro, Redações depois) mas inverte visualmente em `lg:`, colocando "Suas redações" à esquerda (`lg:w-[847px] lg:shrink-0`, valor exato do frame Figma) e "Temas" à direita (`lg:flex-1`). Esse wrapper também ganhou `lg:mx-auto lg:max-w-[1280px]` — decidi colocar o teto de largura aqui (só na Homepage) e não no `AppLayout` compartilhado, porque o Header/Footer têm fundo próprio (`bg-neutral-20`/`bg-neutral-900`) que faz mais sentido ficar full-bleed até a borda da viewport, com o conteúdo é que fica "encaixotado" — e porque outras páginas que usam `AppLayout` (Temas, Detalhe do tema, Correção, Créditos) ainda não têm ticket de desktop resolvida, não fazia sentido pré-formatar a largura delas aqui.

**Temas em `lg:`**: o carrossel horizontal (embla) da versão mobile não faz sentido numa coluna vertical estreita — trocado por uma lista vertical estática (`hidden lg:flex flex-col gap-2.5`), reaproveitando os mesmos `ThemeCard`s (só ganhou `lg:w-full` pra deixar de ter a largura fixa do carrossel) e adicionando o link "Ver todos temas" que o frame desktop tem abaixo da lista (além do "Ver todos" já existente no topo, que o mobile já tinha — os dois convivem, confirmado no frame).

**Estado vazio (`Homepage empty`, `195:1054`)**: mesma estrutura de 2 colunas; a diferença é só a coluna "Suas redações", cujo conteúdo (ícone + texto + botão "Escolher um tema", componente `EssaysEmptyState` já existente) ganhou um wrapper `lg:h-[606px] lg:items-center lg:justify-center` pra ficar centralizado verticalmente numa área de altura fixa, igual ao Figma. Mobile não muda (wrapper sem altura/centralização fora de `lg:`).

**User menu (`195:391`)**: o dropdown já existia em `AppLayout.tsx` desde a ticket 03 (não é UI nova — ao contrário do que a ticket cogitava, ele já é usado em qualquer largura de tela, disparado ao clicar no ícone de usuário do header). Comparado com o frame, achei e corrigi um bug pré-existente: o "!" da saudação ("Olá, {nome}!") estava fora do `<span>` em negrito — no Figma o "{nome}!" inteiro é negrito, só o "Olá," fica regular. Corrigido. Fora isso o dropdown já batia (mesmo padding/gap/sombra/conteúdo — nome+email+botão "Sair").

**Decisão sem grilling ao vivo (sessão em background, sem usuário síncrono pra confirmar)**: os frames "Homepage" e "Homepage empty" do Figma desktop só mostram o ícone de usuário no header — sem o ícone de créditos/notas que hoje é o único ponto de entrada pro `PriceModal` (decisão da ticket 03). Confirmei que a omissão é consistente nos dois frames (não parece erro pontual) e que o "User menu" também não tem linha de créditos. Não removi a funcionalidade: o ícone de créditos continua visível abaixo de `lg:` (mobile intocado) e ganhou `lg:hidden` — ou seja, em telas largas o usuário perde esse atalho direto e só compra crédito via o fluxo de "sem crédito" no detalhe do tema (ticket 05). Isso é uma lacuna de produto real que fica registrada aqui pro usuário confirmar/reverter; não presumi que a intenção do Figma era remover a funcionalidade de verdade, só seguí o que os 2 frames mostram.

**Extensões de design system**: nenhuma — só classes `lg:` novas em componentes existentes, sem prop/variante nova.

**QA manual no navegador não foi possível** (mesma limitação de tickets anteriores do mapa) — sem ferramenta de automação de browser disponível nesta sessão; validado só por `tsc -b`, `oxlint` e `vite build` limpos, e `/code-review` (2 achados reais corrigidos: `.map()` duplicado entre a versão carrossel/lista de `ThemesSection` — extraído pra uma variável `themeCards` reaproveitada nos dois; e o teto de 1280px que eu tinha colocado errado no `AppLayout` compartilhado em vez de escopado à Homepage, como descrito acima).
