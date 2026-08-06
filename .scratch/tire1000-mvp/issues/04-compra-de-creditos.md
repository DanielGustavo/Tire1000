# 04 — Compra de créditos

**What to build:** Usuário autenticado compra créditos a qualquer momento via checkout do Stripe, é redirecionado de volta à plataforma após o pagamento, e tem o saldo atualizado assim que o webhook confirma o pagamento.

**Blocked by:** 02 — Cadastro e login

**Status:** ready-for-agent

- [ ] `POST /credits/checkout { creditsQty }` cria uma Checkout Session no Stripe usando um Price fixo por crédito, com `quantity = creditsQty`, e grava `Checkout` com `status: PENDING`
- [ ] Essa mesma lógica de criação de Checkout é extraída/reaproveitada por `SignUpUser` (ticket 02), que passa a criar um Checkout automaticamente no cadastro — compra continua opcional, usuário loga e usa a plataforma normalmente mesmo sem concluir o pagamento (ver ADR-0005)
- [ ] Endpoint de webhook do Stripe valida a assinatura do evento antes de processar
- [ ] `ConfirmCreditsCheckout` credita o usuário (`User.credits += creditsQty`) e atualiza `Checkout.status = COMPLETED`, usando o `amountInCents` retornado pelo Stripe — nunca um valor vindo do cliente (ADR-0002)
- [ ] Usuário é redirecionado de volta à plataforma após concluir ou cancelar o pagamento
- [ ] Testes Vitest dos casos de uso `RequestCreditsCheckout`/`ConfirmCreditsCheckout` com fake do gateway do Stripe
- [ ] Tela de saldo de créditos e fluxo de compra no front

## Comments

Incongruência encontrada durante a implementação da ticket 03: a spec.md original dizia "signup não cria Checkout — compra é sempre um passo separado e opcional" (ticket 02, já implementada). Confirmado com o usuário que isso mudou: signup deve criar o Checkout automaticamente, mas sem tornar o pagamento obrigatório (usuário sem crédito continua logando e navegando normalmente). Ver ADR-0005 e spec.md atualizados.