# 04 — Compra de créditos

**What to build:** Usuário autenticado compra créditos a qualquer momento via checkout do Stripe, é redirecionado de volta à plataforma após o pagamento, e tem o saldo atualizado assim que o webhook confirma o pagamento.

**Blocked by:** 02 — Cadastro e login

**Status:** ready-for-human

- [x] `POST /credits/checkout { creditsQty }` cria uma Checkout Session no Stripe usando um Price fixo por crédito, com `quantity = creditsQty`, e grava `Checkout` com `status: PENDING`
- [x] Essa mesma lógica de criação de Checkout é extraída/reaproveitada por `SignUpUser` (ticket 02), que passa a criar um Checkout automaticamente no cadastro — compra continua opcional, usuário loga e usa a plataforma normalmente mesmo sem concluir o pagamento (ver ADR-0005)
- [x] Endpoint de webhook do Stripe valida a assinatura do evento antes de processar
- [x] `ConfirmCreditsCheckout` credita o usuário (`User.credits += creditsQty`) e atualiza `Checkout.status = COMPLETED`, usando o `amountInCents` retornado pelo Stripe — nunca um valor vindo do cliente (ADR-0002)
- [x] Usuário é redirecionado de volta à plataforma após concluir ou cancelar o pagamento
- [x] Testes Vitest dos casos de uso `RequestCreditsCheckout`/`ConfirmCreditsCheckout` com fake do gateway do Stripe
- [x] Tela de saldo de créditos e fluxo de compra no front

## Comments

Incongruência encontrada durante a implementação da ticket 03: a spec.md original dizia "signup não cria Checkout — compra é sempre um passo separado e opcional" (ticket 02, já implementada). Confirmado com o usuário que isso mudou: signup deve criar o Checkout automaticamente, mas sem tornar o pagamento obrigatório (usuário sem crédito continua logando e navegando normalmente). Ver ADR-0005 e spec.md atualizados.

Implementado. Backend: `Checkout` (entidade imutável, `create`/`reconstitute`/`complete`) + `CheckoutRepository` (`DynamoCheckoutRepository` real, `InMemoryCheckoutRepository` fake) com PK/SK `CHECKOUT#<externalId>`. `PaymentGateway` (porta) com `StripePaymentGateway` (real, usando o SDK `stripe`) e `InMemoryPaymentGateway` (fake); erro `InvalidWebhookSignatureError`. A lógica de "criar Stripe Checkout Session + gravar `Checkout` PENDING" foi extraída em `createCheckoutForUser` (helper, não caso de uso à parte), reaproveitado por `RequestCreditsCheckout` (resolve o usuário autenticado a partir do `sub` do JWT) e por `SignUpUser` (já tem o `User` recém-criado em mãos, sem precisar resolver por `sub`). `ConfirmCreditsCheckout` é idempotente contra reentrega do mesmo evento de webhook via update condicional no `Checkout` (`status: PENDING → COMPLETED`); só quem "vence" a condição credita o usuário (ver ADR-0007 — novo).

Duas incongruências adicionais encontradas durante a implementação, ambas documentadas em ADR:
- O modelo original não previa como resolver o usuário autenticado a partir do JWT (só o `sub`/Cognito) nas rotas que precisam saber *quem* está logado, não só que alguém está. `User` passou a usar GSI2 (livre até então) pra isso — `UserRepository.findByExternalId` (ver ADR-0006 — novo).
- A tela de saldo de créditos no front (item deste checklist) precisa buscar o saldo atualizado a qualquer momento, não só logo após signup/login. Adicionado `GET /users/me` (caso de uso `GetCurrentUser`, não previsto na lista original de 12 casos de uso do MVP).

Outras decisões de implementação:
- `POST /credits/webhook` não tem `cognitoAuthorizer` (o Stripe não teria como se autenticar como um usuário) — a segurança da rota é inteiramente a validação de assinatura HMAC do payload.
- Quantidade de créditos do checkout automático do signup fixada em `DEFAULT_SIGNUP_CREDITS_QTY = 5` (constante em `sign-up-user.ts`) — não havia número definido na spec; é um placeholder de produto, fácil de ajustar depois.
- Falha ao criar o checkout automático do signup (Stripe fora do ar, etc.) não derruba o cadastro — `SignUpUser` captura o erro e retorna `checkoutUrl: null`, coerente com a compra ser opcional.
- Front: `/credits` mostra o saldo (via `GET /users/me`), formulário de compra (`POST /credits/checkout`, redireciona pra `checkoutUrl`), e trata os query params `?checkout=success|cancel` do retorno do Stripe. Signup agora navega pra `/credits` (em vez de `/`) passando o `checkoutUrl` inicial via router state, com opção de pular.
- Ainda falta, fora do escopo de agente: cadastrar o Price no Stripe (ADR-0002) e configurar `STRIPE_SECRET_KEY`/`STRIPE_PRICE_ID`/`STRIPE_WEBHOOK_SECRET`/`FRONTEND_URL` no ambiente antes do deploy (por isso o status `ready-for-human`, e não `ready-for-agent`/done — nenhum comando do Serverless roda por agente).