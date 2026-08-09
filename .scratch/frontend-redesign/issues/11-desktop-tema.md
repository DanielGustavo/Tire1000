# Detalhe do tema, com e sem crédito (desktop)

Type: prototype

Blocked by: 05

Status: resolved

## Question

Adaptar o detalhe do tema construído na ticket "Detalhe do tema, com e sem crédito (mobile)" para desktop, usando o frame "Tema" (nó `195:1882`, canvas Desktop `106:1830`) como referência. O Figma não tem um frame de desktop separado para a variante "sem crédito" — confirmar se é só o mesmo layout com o CTA trocado (consistente com o comportamento no mobile) via `get_design_context`.

## Answer

`frontend/src/pages/themes/theme-detail.tsx` ganhou classes `lg:`. Página com teto `lg:mx-auto lg:max-w-[1280px]` + `lg:px-10` (escopado à própria página, mesmo padrão das tickets 08/09/10). Layout troca a coluna única por 2 colunas em `lg:` (`flex-row`), batendo com o frame "Tema" desktop: "Article Section" à esquerda (back button + badges/título + textos motivadores, nesse aninhamento — bloco de 16px seguido de bloco de 24px, igual ao "Section title"/"Article Section" do próprio Figma) e um card de CTA fixo (295px, borda 2px, `shadow-hard`) à direita, substituindo a barra sticky no rodapé do viewport que o mobile usa (a barra continua sticky/full-width abaixo de `lg:`). O card desktop ganha título+subtítulo ("Já finalizou sua redação?"/"Envie-a aqui para que possamos avaliá-la rapidamente!") que não existem no mobile — copy nova do Figma, visível só em `lg:`. Imagem do Texto motivador II fica com largura fixa 434px centralizada em `lg:` (mobile continua `w-full`), batendo com o frame.

**Decisão sobre a variante "sem crédito"**: confirmada via `get_design_context` no nó `195:1882` — o Figma só tem UMA frame "Tema" no canvas Desktop, sem um segundo nó equivalente aos `207:3552`/`207:3677` do mobile (com/sem crédito). A ausência de uma segunda frame é tratada como confirmação da hipótese da ticket: o layout desktop é idêntico em qualquer estado de crédito, só o destino do CTA muda — comportamento já resolvido na ticket 05 (`handleStartEssay` em `useThemeDetailPage.ts`, intocado por esta ticket, que é puramente visual).

`/code-review` (eixo Standards): nenhuma violação dura. 1 smell de baixo risco (Duplicated Code: `lg:w-[434px]` repetido na imagem e na legenda do Texto motivador II) — corrigido movendo a largura fixa pro wrapper (`lg:mx-auto lg:w-[434px]`), removendo a duplicação. `/code-review` (eixo Spec): 1 achado real — o merge do bloco de back-button/badges/título com a lista de textos motivadores num único `flex flex-col gap-6` tinha achatado 2 gaps distintos do mobile (16px entre back-button e badges, 24px entre esse bloco e a lista de textos) num só valor, mudando espaçamento mobile sem querer (fora do escopo `lg:` desta ticket). Corrigido reaninhando os blocos (bloco `gap-4` com back-button+badges/título, depois lista de textos como irmão dentro do wrapper `gap-6`) — o que também bate exatamente com o aninhamento "Section title" (gap 16px) dentro de "Article Section" (gap 24px) do Figma desktop.

QA manual em browser não foi possível (sem automação de browser disponível nesta sessão) — validado só por `tsc -b`/`oxlint`/`vite build` limpos + `/code-review`.
