# Correção: resultado da Revisão/Avaliação (desktop)

Type: prototype

Blocked by: 07

Status: resolved

## Question

Adaptar a tela de resultado da Correção construída na ticket "Correção: resultado da Revisão/Avaliação (mobile)" para desktop, usando os frames "Correção" (nó `195:2146`), "Correção - in progress" (nó `195:2722`) e "Correção - loading" (nó `195:2906`) do canvas Desktop (`106:1830`) como referência.

## Answer

`frontend/src/pages/essay-result/essay-result.tsx` ganha `lg:mx-auto lg:max-w-[1280px] lg:px-10` (escopado à página, mesmo padrão das tickets 08-12). Layout troca a coluna única (back button/título/texto da redação/notas todos empilhados) por 2 colunas em `lg:` — Article Section (back button + título + data + texto da redação) `flex-1` à esquerda, sidebar fixa de 403px com as notas por competência (C1-C5) + nota final à direita — batendo com o frame "Correção" desktop (`195:2146`). No mobile o layout visual não muda (mesma pilha vertical de antes, só reorganizada em 2 divs irmãs em vez de um componente único).

**Os 2 estados pendentes** ("Correção - in progress" `195:2722`/"Correção - loading" `195:2906`) também ganharam layout desktop, não só o de sucesso: mesmo formato de 2 colunas, mas a sidebar vira um skeleton decorativo (`CompetencyScoresSkeleton`, novo) com "???" no lugar das notas e a mensagem de status repetida em cada cartão, a 45% de opacidade, visível só em `lg:` — no mobile esses estados continuam sem sidebar nenhuma (só o cartão com o post-it, `PendingResult`, decisão já fechada na ticket 07 e não reaberta aqui). `PendingResult` ganhou `lg:min-h-[518px]` pra bater com a altura do cartão de texto no frame desktop.

**Highlight/comentário do avaliador — hover vs. tap/click**: `HighlightedEssayText.tsx` ficou intocado, continua tap/click pra abrir/fechar (decisão da ticket 07). Essa era a candidata explícita a reabrir citada no briefing (desktop tem hover, mobile não), mas não teve `/grilling` ao vivo por ser sessão em background sem usuário síncrono — seguida a instrução padrão do map pra esse caso: default pra opção que muda menos o comportamento existente. Fica como pendência pra confirmar/decidir com o usuário se vale a pena diferenciar hover em telas largas.

**Refatoração motivada pelo `/code-review`** (2 eixos rodados via skill, comparando contra o HEAD anterior à ticket): eixo **Spec** não achou nenhum problema (todos os 3 estados cobertos, sem scope creep, breakpoint/padrão de teto batendo com as tickets 08-12, `HighlightedEssayText.tsx` confirmado byte-a-byte intocado). Eixo **Standards** achou 2 achados de baixo risco, ambos corrigidos antes do commit: (1) duplicação real de JSX entre `CompetencyScores`/`CompetencyScoresSkeleton` — corrigida extraindo `CompetencyScoreCard.tsx`/`FinalScoreCard.tsx` (compartilhados pelos dois); (2) a variável `success` guardava um objeto, não um boolean — renomeada pra `evaluationResult`. Também promovido `pendingResultHeading` pra `essay-service.ts` (mesma categoria de extração que a ticket 07 já tinha feito com `VALIDATING_STATUSES`/`EVALUATING_STATUSES`), compartilhado entre `PendingResult` e o skeleton pra não duplicar a mensagem "Analisando a foto"/"Corrigindo sua redação".

**QA manual em navegador não foi possível** (mesma limitação das tickets 08-12) — sem ferramenta de automação de browser disponível nesta sessão; validado só por `tsc -b`/`oxlint`/`vite build` limpos + `/code-review`.
