# Correção: resultado da Revisão/Avaliação (mobile)

Type: prototype

Blocked by: 01

## Question

Construir a tela de resultado da Correção (mobile) a partir do Figma (seção "Correção", nó `207:3678`, canvas Responsive `5:1551`), substituindo `essay-result.tsx`:

- **Correção - loading** (`172:3346`) — aguardando a Revisão (`VALIDATING`) ou Avaliação (`EVALUATING`) terminar.
- **Correção - in progress** (`172:3156`) — estado intermediário (a diferenciar de "loading" com `get_design_context`; possivelmente loading = spinner inicial, in progress = já processando com alguma info parcial).
- **Correção** (`148:2787`, resultado final) — texto da redação com os `EssayHighlight`s marcados (ver `CONTEXT.md`: `textContent` do highlight é o comentário do avaliador, exibido só no hover — não é a citação em si), nota e parecer por competência (C1-C5), nota final e parecer geral.
- price modal (`207:3637`) + stripe (`207:3666`) — upsell de compra de crédito a partir daqui (ponto de entrada a confirmar).

Esta tela é reaberta tanto pelo fluxo de envio (ticket 06) quanto por um item da lista "Suas redações" na Homepage (ticket 03) — os dois entram no mesmo componente de resultado.
