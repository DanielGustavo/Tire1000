# 07 — Pipeline de Avaliação e histórico de redações

**What to build:** A redação revisada é avaliada nas 5 competências do ENEM. Usuário vê sua lista de redações enviadas e o detalhe de uma redação específica, com notas, pareceres e trechos destacados.

**Blocked by:** 06 — Pipeline de Revisão

**Status:** ready-for-agent

- [x] `EvaluateEssay` chama o Gemini (fake nos testes) com 5 prompts — um por competência, avaliada independentemente — e retorna scores + highlights
- [x] Em sucesso: `EssayEvaluation` gravada (scores C1-C5 + final, highlights), `Essay.finalScore` preenchido, `status: SUCCESS`
- [x] Em falha de sistema após 3 tentativas: `status: EVALUATION_FAILED`, crédito **não** é devolvido (ADR-0001), mensagem na DLQ de Avaliação, alerta por email ao dev
- [x] Custo estimado (tokens, `amountInCents`, `step: EVALUATION`) registrado em `EssayCost`
- [x] `GET /essays` lista as redações do usuário logado, ordenadas pela ordem de envio, com título e cor do eixo denormalizados
- [x] `GET /essays/{essayId}` retorna tema, data de envio, texto, highlights, notas das 5 competências e avaliação geral — restrito ao dono da redação
- [x] Testes Vitest do caso de uso `EvaluateEssay` (sucesso e falha) e de `ListUserEssays`/`GetEssayDetail` com fakes
- [x] Telas de histórico de redações (lista) e detalhe (notas, pareceres, highlights) no front
