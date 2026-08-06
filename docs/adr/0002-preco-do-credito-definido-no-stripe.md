# Preço do crédito definido no Stripe, não em tabela própria

O preço por crédito é um Price cadastrado no Stripe, não uma tabela de preços no DynamoDB. Ao criar a Checkout Session, o backend usa esse Price com `quantity = creditsQty` e confia no valor total retornado pelo Stripe (via metadata do evento de webhook) para preencher `amountInCents` no registro de Checkout — nunca aceita esse valor vindo do cliente. Trade-off: menos flexibilidade para lógica de desconto/cupom customizada no futuro, mas evita manter duas fontes de verdade para preço.
