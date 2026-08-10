# Parecer geral sintetizado por IA em vez de concatenado

Status: ready-for-agent

## O que fazer

Hoje `EssayEvaluationScores.final.evaluationText` é gerado localmente por `buildFinalScore` (`backend/src/infra/gateways/gemini-essay-evaluation-gateway.ts`), que só concatena os 5 pareceres de competência com o título de cada uma na frente, junto de `\n\n`. Isso é redundante — os 5 pareceres já aparecem individualmente na tela. Ver `docs/adr/0016-parecer-geral-sintetizado-por-ia-em-vez-de-concatenado.md` pra decisão completa e motivação.

### Novo prompt

- Criar `backend/src/domain/ai/evaluation-summary/` (ou nome equivalente), com `prompt.ts` + `schema.ts`, seguindo a convenção das pastas irmãs (`domain/ai/evaluation/`, `domain/ai/validation/`) e o esqueleto padrão de prompt (`# Papel e Objetivo` / `# Instruções` / `# Instruções finais` — ver skill `ai-prompts`).
- Entrada do prompt: os 5 pares (título da competência + score + parecer) e o `themeTitle` da redação. **Não** incluir o `textContent` completo da redação — decisão do ADR 0016 (os 5 pareceres já citam trechos relevantes quando útil; reenviar a redação inteira encareceria/atrasaria sem ganho claro).
- Saída: só `evaluationText` (o parecer geral sintetizado). O `score` do slot `final` continua sendo a soma local dos 5 — não sai desse novo prompt.
- Tom: parecer geral fala diretamente com o estudante, mais direto/humano — é o único parecer que pode abrir reconhecendo pontos fortes e fechar com uma nota de incentivo (ver ticket 03 — os pareceres de competência individuais NÃO devem ter saudação/despedida, só o geral, pra não repetir 5x na tela).

### Wiring

- `gemini-essay-evaluation-gateway.ts`: depois do `Promise.all` das 5 chamadas de competência, adicionar a chamada ao novo prompt, passando os 5 resultados + `themeTitle`. Roda sequencialmente após as 5 (que continuam paralelas entre si) — mesmo Lambda/fila de Avaliação, dentro do timeout de 90s existente.
- Substituir a geração de texto de `buildFinalScore` pela nova chamada — o `score` (soma) continua calculado localmente ali; só o `evaluationText` passa a vir do novo prompt.
- Falha dessa chamada segue o mesmo padrão "tudo ou nada" já existente no use-case (`evaluate-essay.ts`, `evaluationAttempts`/`MAX_ESSAY_EVALUATION_ATTEMPTS`) — não precisa de tratamento novo, só garantir que uma falha aqui propaga do mesmo jeito que uma falha nas 5 chamadas de competência propaga hoje.

## Fora de escopo

- Reenviar `textContent` completo da redação pro novo prompt (ADR 0016).
- Mudar como o `score` numérico do `final` é calculado (continua soma local).
- Retry/timeout dedicado pra essa chamada — usa o mesmo mecanismo de redrive via SQS que as outras.
- Reprocessar Avaliações já feitas com o texto concatenado antigo (sem backfill, ver map.md).

## Testes

- Camada de application, seguindo a convenção do `CLAUDE.md`: cobrir o caminho que hoje testa `evaluate-essay`/o gateway de Avaliação (confirmar onde a suíte atual injeta o fake de IA durante a implementação). Casos mínimos: parecer geral vem da nova chamada (não é mais concatenação dos 5), score final continua sendo a soma dos 5, e falha da nova chamada propaga como falha geral da Avaliação (mesmo caminho que falha de uma das 5 chamadas de competência já usa hoje).
