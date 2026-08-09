# Correção: resultado da Revisão/Avaliação (mobile)

Type: prototype

Blocked by: 01

Status: resolved

## Question

Construir a tela de resultado da Correção (mobile) a partir do Figma (seção "Correção", nó `207:3678`, canvas Responsive `5:1551`), substituindo `essay-result.tsx`:

- **Correção - loading** (`172:3346`) — aguardando a Revisão (`VALIDATING`) ou Avaliação (`EVALUATING`) terminar.
- **Correção - in progress** (`172:3156`) — estado intermediário (a diferenciar de "loading" com `get_design_context`; possivelmente loading = spinner inicial, in progress = já processando com alguma info parcial).
- **Correção** (`148:2787`, resultado final) — texto da redação com os `EssayHighlight`s marcados (ver `CONTEXT.md`: `textContent` do highlight é o comentário do avaliador, exibido só no hover — não é a citação em si), nota e parecer por competência (C1-C5), nota final e parecer geral.
- price modal (`207:3637`) + stripe (`207:3666`) — upsell de compra de crédito a partir daqui (ponto de entrada a confirmar).

Esta tela é reaberta tanto pelo fluxo de envio (ticket 06) quanto por um item da lista "Suas redações" na Homepage (ticket 03) — os dois entram no mesmo componente de resultado.

## Answer

`frontend/src/pages/essay-result/` reescrito (migrado pra pasta por página), substitui `essay-result.tsx` flat.

- **Loading vs in-progress**: só o texto muda ("...carregando nossa correção..." vs "...corrigindo a sua redação..."), bate 1:1 com a distinção já existente `VALIDATING_STATUSES`/`EVALUATING_STATUSES` (agora promovidas pra `essay-service.ts`, reusadas por essa página e por `EssayStatusHeader`).
- **Highlight/comentário do avaliador em mobile**: o "highlight modal" do Figma aparece sempre visível como exemplo estático, mas `CONTEXT.md` registra o `textContent` do `EssayHighlight` como hover-only — e essa tela é mobile-first (hover não existe em touch). Decisão (usuário, via `/grilling`): tocar/clicar no trecho destacado abre o sticky-note com o comentário (mesmo handler serve mouse e touch); tocar fora fecha. `HighlightedEssayText.tsx` (novo).
- **Texto lowercase do Figma**: os textos de exemplo (redação e pareceres) vêm com classe `lowercase` no output do Figma — é só artefato do lorem ipsum já vir em minúsculas, não uma decisão de design. Ignorado; texto real renderiza como veio do backend.
- **Controle de acesso**: a página só renderiza pra status pendentes (`UPLOADING`/`QUEUED`/`VALIDATING`/`VALIDATED`/`EVALUATING`) e `SUCCESS`. Os 4 status terminais sem sucesso (`REJECTED`/`UPLOAD_FAILED`/`VALIDATION_FAILED`/`EVALUATION_FAILED`) redirecionam pra Home (`useEssayResultPage.ts`) — decisão do usuário: o card da Homepage é onde o usuário age sobre eles, não essa tela. Novo `BLOCKED_ESSAY_RESULT_STATUSES` em `essay-service.ts`.
- **Reenvio de foto**: adaptado o fluxo completo da ticket 06 (`TipsModal` → confirmação → loading/erro) pra reenvio em vez de só upload novo — extraído o step machine pra `useEssayCaptureFlow.ts` (compartilhado), parametrizado por `onSubmit`/`onSuccess`. Reenvio (`useEssayResendFlow.ts` + `EssayResendFlow.tsx`, ambos em `pages/home/components/`) fixa `mode="upload"`, chama `essayService.resend(essayId)`, e é disparado **por estado local no `EssayCard`** — decisão explícita do usuário de não usar rota pra abrir modal (nota de pendência abaixo). `EssayCard`: `REJECTED`/`UPLOAD_FAILED`/`VALIDATION_FAILED` abrem o fluxo inline; `EVALUATION_FAILED` não mostra nenhum botão (credito não é devolvido, ADR-0001 — resend não se aplica); `UPLOADING` continua linkando pra `/essays/{id}` (não é terminal, mostra a tela de loading normalmente).
- **Price modal / upsell de crédito**: investigado — os nós `207:3637`/`207:3666` citados na ticket são só o componente `PriceModal` genérico posicionado no canvas do Figma perto dessa tela, sem CTA embutido no frame "Correção". Confirmado com o usuário: nenhum entry point novo aqui — o ícone de créditos do `AppLayout` (resolvido na ticket 03) já cobre, já que essa rota herda o layout.
- **Badges de ENEM/eixo no header**: o Figma mostra "ENEM 2025" + "Cidadania" no topo, mas `Essay` só denormaliza `themeTitle`/`topicColor` (setados no upload) — não tem o ano do ENEM nem o nome do eixo. Gap de backend real (mesma categoria da ticket 05), mas o usuário optou por **simplificar em vez de fechar o gap**: a tela mostra só título + data, sem essas badges.
- **Cores de competência**: C1=`primary-100` `#81EEB7`, C2=`alert-100` `#FFED7A`, C3=`error-100` `#EF8D80`, C4=`info-300` `#7AD3FF`, C5=`pink-300` `#EF80BD` — batem exatamente com os tokens já existentes (promovidas pra `COMPETENCY_COLORS` em `essay-service.ts`). Notas de badge mostram o número cru (sem "/200"/"/1000"), igual ao Figma.
- Novo componente de design system `PaperCard` (papel pautado com borda recortada) — 2 usos nessa ticket (texto da redação + nota final). **A borda recortada não é mais um asset** — a primeira versão baixava `paper-edge.svg` do Figma e esticava via `background-size: 100% 100%`, o que só ficava certo na largura mobile pra qual foi desenhado (distorcia em qualquer outra largura, ex. desktop sem cap ainda). Reescrita como `radial-gradient` repetido (raio fixo em px, não %) — mesmo tamanho de bump em qualquer largura de card, de ~40px a 1400px+, testado nos dois extremos. As linhas pautadas também são CSS (`repeating` via `background-image`/`background-size`, em `em` amarrado ao `line-height` real do texto, não px fixo, senão desalinha conforme o card cresce). Token novo `--color-neutral-50: #c6c8c7` (cor da linha). `Bullet` ganhou variante `dark-outline` (mesmo visual de `dark`, borda preta em vez de branca — pro uso direto sobre fundo claro).

### Pendência registrada (fora de escopo desta ticket)

O usuário não quer mais rotas dedicadas só pra abrir modais (`/essays/new` faz isso hoje pro fluxo de envio/ticket 06) — pediu pra anotar e tratar depois numa refactor da plataforma inteira, não nessa ticket. O fluxo de reenvio desta ticket já evita introduzir uma nova instância desse padrão (usa estado local, não rota).

## Comments

Refactor implementado em [08-modais-sem-rota](08-modais-sem-rota.md) — `/essays/new`, `/login` e `/signup` removidos, migrados pro mesmo padrão de estado local do `EssayResendFlow` desta ticket.
