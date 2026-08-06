# 05 — Envio e reenvio de redação

**What to build:** Usuário autenticado envia (ou reenvia) uma foto de redação vinculada a um tema. Recebe uma URL pré-assinada, faz upload direto pro bucket S3, e a redação entra na fila de Revisão.

**Blocked by:** 02 — Cadastro e login, 03 — Temas e eixos (leitura)

**Status:** ready-for-agent

- [ ] `POST /essays { themeId }` cria uma `Essay` com `status: UPLOADING` e retorna uma URL pré-assinada de upload
- [ ] `POST /essays/{essayId}` (reenvio) reseta a `Essay` existente e gera uma nova URL pré-assinada
- [ ] O envio é rejeitado com um erro claro se o usuário não tiver ao menos 1 crédito disponível
- [ ] Fotos maiores que 10MB são rejeitadas
- [ ] O trigger do S3 (`EnqueueEssayValidation`) atualiza a `Essay` para `status: QUEUED` e envia para a fila de Revisão
- [ ] Testes Vitest dos casos de uso `UploadEssay`/`ResendEssay`/`EnqueueEssayValidation` com fakes de S3/SQS/repositório
- [ ] Tela de envio de redação (seleção de tema + captura/upload de foto) no front
