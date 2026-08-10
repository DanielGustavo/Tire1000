# Parecer geral sintetizado por IA em vez de concatenado

Status: resolved

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

## Answer

Implementado como descrito, sem desvios de escopo:

- Novo `backend/src/domain/ai/evaluation-summary/` (`prompt.ts` + `schema.ts`), seguindo o esqueleto padrão (`# Papel e Objetivo`/`# Instruções`/`# Instruções finais`, ver skill `ai-prompts`) e a convenção das pastas irmãs. `schema.ts` só tem `evaluationText`. `prompt.ts` recebe os 5 pares `{título da competência, score, parecer}` (via `EVALUATION_COMPETENCIES` + `scores`) e `themeTitle` — nunca `textContent` (ADR-0016). Tom instruído: fala direto com o estudante, abre reconhecendo um ponto forte e fecha com incentivo — diferente dos 5 pareceres de competência, que continuam técnicos e sem saudação (ticket 03).
- `gemini-essay-evaluation-gateway.ts`: depois do `Promise.all` das 5 chamadas de competência, uma 6ª chamada sequencial ao novo prompt (mesmo `EVALUATION_MODEL`, sem model dedicado — não havia motivo pra isolar um só pra essa etapa). `buildFinalScore` foi trocado por `sumCompetencyScores` (só a soma, sem mais gerar texto por concatenação); `final.evaluationText` passa a vir de `summary.data.evaluationText`. Tokens/custo da 6ª chamada somados aos das 5. Falha da 6ª chamada não tem tratamento próprio — propaga do `evaluate()` pro `try/catch` de `evaluate-essay.ts` exatamente como a falha de uma das 5 chamadas de competência já propagava.
- Teste dedicado adicionado em `backend/src/infra/gateways/gemini-essay-evaluation-gateway.test.ts`, mockando `callGeminiModel` — decisão de execução que se desviou da leitura mais literal da convenção do `CLAUDE.md` ("testes vivem na camada de application"): a suíte de `evaluate-essay.test.ts` injeta `InMemoryEssayEvaluationGateway`, um fake que substitui o gateway inteiro (não só a chamada de IA), então não consegue observar se o parecer geral realmente vem da 6ª chamada em vez de concatenação — só um teste no próprio `GeminiEssayEvaluationGateway` consegue verificar isso. Cobre os 2 casos pedidos que dependem do gateway real: parecer geral vem da chamada nova (não concatenação) com score final = soma dos 5, e falha da chamada de síntese propaga do mesmo jeito que falha de uma chamada de competência. `evaluate-essay.ts`/`evaluate-essay.test.ts` não mudaram — o use-case já tratava o gateway como caixa-preta, então nada ali dependia da concatenação antiga.
- Verificado com `tsc --noEmit` limpo e suíte completa do backend (183/183, incluindo os 2 testes novos).
