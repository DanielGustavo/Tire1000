# 06 — Pipeline de Revisão

**What to build:** A foto enviada é processada pela etapa de Revisão: o Gemini faz OCR do texto ou retorna motivos de rejeição, o crédito é debitado (e devolvido em caso de rejeição ou falha de sistema), e o custo estimado é registrado. Usuário vê o resultado — aprovado ou motivo da rejeição com opção de reenvio.

**Blocked by:** 05 — Envio e reenvio de redação

**Status:** ready-for-agent

- [ ] `ValidateEssay` debita 1 crédito do usuário ao iniciar o processamento
- [ ] Chamada ao Gemini (fake nos testes) retorna o texto OCR'd da redação (sucesso) ou motivos de rejeição — letra ilegível, iluminação baixa, menos de 7 linhas, mais de 30 linhas
- [ ] Em sucesso: `Essay.textContent` preenchido, `status: VALIDATED`, `fileKey: null` e a foto é removida do bucket
- [ ] Em rejeição: `status: REJECTED`, `rejectedAttempts` incrementado, `validationAttempts` resetado, `rejectionReasons` preenchido, `fileKey: null`, crédito devolvido
- [ ] Em falha de sistema após 3 tentativas: `status: VALIDATION_FAILED`, crédito devolvido, mensagem na DLQ de Revisão, alerta por email (SNS) ao dev
- [ ] `rejectedAttempts > 10` dispara um alerta por email ao dev, sem outra ação automática
- [ ] Custo estimado (tokens, `amountInCents`, `step: VALIDATION`) registrado em `EssayCost`
- [ ] Testes Vitest do caso de uso `ValidateEssay` cobrindo os três desfechos (sucesso, rejeição, falha de sistema) com fakes de Gemini/S3/repositórios
- [ ] Tela de resultado da Revisão no front (aprovado, ou motivo da rejeição com CTA de reenvio)
