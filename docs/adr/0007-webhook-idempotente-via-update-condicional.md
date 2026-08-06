# Webhook do Stripe idempotente via update condicional no Checkout

O Stripe pode reentregar o mesmo evento de webhook mais de uma vez (falha de rede, timeout na resposta, retry automático do lado deles). `ConfirmCreditsCheckout` precisa ser seguro contra isso — sem gravar 2 créditos pra uma única compra.

`Checkout` e `User` são itens diferentes na tabela; sem uma transação (`TransactWriteItems`), não dá pra garantir atomicidade entre "marcar o Checkout como COMPLETED" e "creditar o usuário" com uma única escrita. A alternativa escolhida evita `TransactWriteItems` (mais uma dependência de infra pra manter, dado o estágio do produto) em favor de uma ordem específica com garantia condicional:

1. `CheckoutRepository#complete` faz um `UpdateItem` com `ConditionExpression: status = PENDING`. Só um caller "vence" essa condição por Checkout.
2. Só quem venceu credita o usuário (`UserRepository#incrementCredits`, um `ADD` atômico no Dynamo).
3. Se a condição falhar (`applied: false`), a entrega é tratada como já processada — `confirmed: true`, sem tocar em `credits`.

Trade-off aceito conscientemente: se o processo morrer *entre* o passo 1 e o passo 2 (Checkout já `COMPLETED`, mas o crédito ainda não foi somado), fica um estado inconsistente que exige reconciliação manual — não há retry automático pra esse caso específico, porque uma reentrega do mesmo evento veria `status: COMPLETED` e pularia o crédito (evitar duplicar é priorizado sobre nunca perder, dado que é dinheiro real do usuário — mesmo espírito da ADR-0002).
