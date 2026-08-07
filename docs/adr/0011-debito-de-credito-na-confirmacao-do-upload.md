# Débito do crédito acontece na confirmação do upload, não no início da Revisão

O plano original (spec.md, issue 06) previa debitar o crédito do usuário só quando `ValidateEssay` começasse a processar a redação, no início da fila de Revisão. Como essa fila pode demorar a esvaziar, o usuário só veria o crédito sair da conta bem depois de enviar a foto — descolado do momento em que ele efetivamente "gastou" a tentativa. O débito passou a acontecer em `EnqueueEssayValidation`, na transição `UPLOADING → QUEUED`, assim que o S3 confirma que o arquivo chegou.

O estorno em caso de rejeição ou falha de sistema na Revisão continua existindo sem mudança de comportamento (ver ADR-0001 pra a assimetria com a Avaliação, que também não muda) — só quem passou a mexer no saldo primeiro foi `EnqueueEssayValidation`, não `ValidateEssay`.

Dois cuidados de concorrência, resolvidos sem `TransactWriteItems` (mesma decisão da ADR-0007, pelo mesmo motivo: infra extra pra manter, dado o estágio do produto):

1. **Redelivery do mesmo evento do S3** (entrega at-least-once): a transição condicional do `Essay` (`UPLOADING → QUEUED`, `ConditionExpression` no Dynamo) roda **antes** do débito. Só uma invocação concorrente "ganha" essa condição por redação — evita debitar duas vezes a mesma redação numa redelivery verdadeiramente concorrente.
2. **Duas redações do mesmo usuário confirmando quase ao mesmo tempo, saldo insuficiente pra ambas**: o débito (`UserRepository#decrementCredits`) é condicionado a `credits >= amount`. Se perder essa corrida, a redação (que já virou `QUEUED` no passo 1) é marcada `UPLOAD_FAILED` em vez de seguir pra fila de Revisão sem ter sido paga — o usuário reenvia depois de repor o saldo (mesmo fluxo de reenvio de uma rejeição, `UPLOAD_FAILED` é resendable).

Trade-off aceito conscientemente: entre os passos 1 e 2 existe uma janela onde a redação já é `QUEUED` mas o crédito ainda não foi confirmado — se o processo morrer nesse meio-tempo, a redação fica presa em `QUEUED` sem nunca ter sido debitada nem enfileirada de fato. Raro, sem tratamento automático por ora (mesmo espírito do trade-off aceito na ADR-0007: evitar duplicar é priorizado sobre nunca perder).
