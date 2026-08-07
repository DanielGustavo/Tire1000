# 05 — Envio e reenvio de redação

**What to build:** Usuário autenticado envia (ou reenvia) uma foto de redação vinculada a um tema. Recebe uma URL pré-assinada, faz upload direto pro bucket S3, e a redação entra na fila de Revisão.

**Blocked by:** 02 — Cadastro e login, 03 — Temas e eixos (leitura)

**Status:** ready-for-agent

- [x] `POST /essays { themeId }` cria uma `Essay` com `status: UPLOADING` e retorna uma URL pré-assinada de upload
- [x] `POST /essays/{essayId}` (reenvio) reseta a `Essay` existente e gera uma nova URL pré-assinada
- [x] O envio é rejeitado com um erro claro se o usuário não tiver ao menos 1 crédito disponível
- [x] Fotos maiores que 10MB são rejeitadas
- [x] O trigger do S3 (`EnqueueEssayValidation`) atualiza a `Essay` para `status: QUEUED`, debita 1 crédito do usuário e envia para a fila de Revisão — se o saldo não for suficiente nesse momento, a `Essay` vai para `status: UPLOAD_FAILED` (resendable) em vez de entrar na fila (ver ADR-0011)
- [x] Testes Vitest dos casos de uso `UploadEssay`/`ResendEssay`/`EnqueueEssayValidation` com fakes de S3/SQS/repositório
- [x] Tela de envio de redação (seleção de tema + captura/upload de foto) no front

## Comments

- O débito do crédito, originalmente planejado pra dentro de `ValidateEssay` (ticket 06), foi movido pra `EnqueueEssayValidation` (ver ADR-0011) — a fila de Revisão pode demorar a esvaziar, e o usuário esperava ver o crédito sair da conta assim que enviasse a foto, não só quando a Revisão começasse a processar.
- Todos os itens implementados; checkboxes marcados. A tela de envio (`frontend/src/pages/essay-upload.tsx`, rota `/essays/new`) cobre o item marcado acima, mas não chama `POST /essays/{essayId}` (reenvio) — não há CTA de reenvio no front ainda. Isso é esperado ficar a cargo do ticket 06, que já lista "Tela de resultado da Revisão no front (aprovado, ou motivo da rejeição com CTA de reenvio)" no seu próprio checklist.
