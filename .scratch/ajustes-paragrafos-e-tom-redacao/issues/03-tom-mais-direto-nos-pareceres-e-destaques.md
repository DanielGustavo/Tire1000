# Tom mais direto nos textos de parecer e destaque

Status: resolved

## O que fazer

Os textos gerados pela Avaliação (pareceres de competência e comentários de destaque) devem soar mais diretos e coloquiais, falando com o estudante, em vez do tom formal/técnico atual. Sem mudar quais critérios são avaliados — só como o feedback é escrito. O parecer geral (ticket 02) é um prompt novo e já nasce com o tom certo — não é escopo desta ticket.

### Pareceres de competência

- `backend/src/domain/ai/evaluation/prompt.ts`, instrução do campo `evaluationText`: hoje pede "um parecer objetivo (2 a 4 frases)". Ajustar a instrução de tom pra mais direto/humano, mantendo a citação de trechos da redação quando útil. **Sem** saudação de abertura nem despedida — isso é exclusivo do parecer geral (ticket 02), pra não repetir 5x na tela (os 5 cards de competência aparecem juntos).

### Destaques

- Mesmo `prompt.ts`, instrução do campo `highlights[].textContent`: hoje pede "um comentário curto (1 a 2 frases)". Ajustar:
  - Tom mais direto/coloquial, uniforme pra qualquer tipo de destaque (linguagem, argumentação, etc.) — o conteúdo muda por competência, o registro não.
  - Limite de tamanho relaxado pra até ~3-4 frases quando fizer sentido pro estilo mais explicativo (ex. sugerir expressões concretas que o estudante pode usar) — não é obrigatório sempre usar o máximo.

### Frontend — popup de destaque

- `frontend/src/pages/essayResult/components/HighlightedEssayText.tsx`: `POPUP_WIDTH_PX` de `260` pra `~320`, pra acomodar textos mais longos com conforto de leitura. Conferir se o cálculo de posicionamento (`left`, que usa `POPUP_WIDTH_PX` pra não estourar a viewport) continua correto com a largura nova.

## Fora de escopo

- Qualquer mudança de critério/matriz de avaliação (`EVALUATION_COMPETENCIES`) — só o texto do feedback muda, não a nota.
- Truncamento ou scroll no popup — ele já cresce em altura livremente, sem corte; só a largura muda.
- Tom do parecer geral — coberto na ticket 02 (prompt novo, dedicado).

## Testes

- Sem teste dedicado esperado — mudança de texto livre em prompt (não lógica) e ajuste de constante CSS/JS. Se o cálculo de posicionamento do popup (`left`) tiver teste de componente existente cobrindo a largura antiga, atualizar o valor esperado.

## Answer

Implementado em `2d31753`.

- `backend/src/domain/ai/evaluation/prompt.ts`: instrução de `evaluationText` reescrita pra "parecer direto e coloquial", falando com o estudante, explicitamente sem saudação/despedida (isso fica só no parecer geral). Instrução de `highlights[].textContent` reescrita pro mesmo registro direto/coloquial uniforme entre tipos de destaque, com o limite relaxado pra 1-2 frases normalmente, podendo chegar a 3-4 quando ajudar a ser mais explicativo (ex. sugerir expressão concreta) — sem forçar o máximo sempre.
- `frontend/src/pages/essayResult/components/HighlightedEssayText.tsx`: `POPUP_WIDTH_PX` de `260` pra `320`. O cálculo de `left` (`window.innerWidth - POPUP_WIDTH_PX - VIEWPORT_MARGIN_PX`) já deriva da constante, então continua correto sem mudança de lógica.
- Sem teste dedicado — não havia teste de componente cobrindo `POPUP_WIDTH_PX` antigo, e a mudança no prompt é texto livre. Typecheck e suíte completa (backend 183 testes) passando; `/code-review` (Standards + Spec) sem findings.
