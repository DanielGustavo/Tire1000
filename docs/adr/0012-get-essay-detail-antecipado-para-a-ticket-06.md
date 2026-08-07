# GetEssayDetail (GET /essays/{essayId}) antecipado pra ticket 06, escopo mínimo

O spec original (spec.md) coloca `GetEssayDetail`/`GET /essays/{essayId}` inteiramente na ticket 07 (histórico + Avaliação). Mas a ticket 06 pede uma tela de resultado da Revisão (aprovado ou motivo da rejeição, com CTA de reenvio) — e como `ValidateEssay` roda assíncrono via fila, o front não tem outro jeito de saber o desfecho sem consultar um endpoint de leitura.

`GetEssayDetail` e `GET /essays/{essayId}` foram implementados já na ticket 06, mas com saída propositalmente mínima: `id`, `status`, `rejectionReasons`, `createdAt` e os campos denormalizados do tema (`themeId`, `themeTitle`, `topicColor`) — só o necessário pra tela de resultado da Revisão (`EssayDTO` em `application/dtos/essay-dto.ts`). `textContent`, `highlights` e as notas por competência ficam pra ticket 07, quando `EvaluateEssay` existir — a expectativa é estender esse mesmo DTO/endpoint, não criar um segundo.
