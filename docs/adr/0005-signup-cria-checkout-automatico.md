# Signup cria um Checkout automaticamente; pagamento continua opcional

`SignUpUser` agora, além de criar a conta no Cognito e o registro de `User` (`credits: 0`), cria também uma Stripe Checkout Session pra compra inicial de créditos (mesma lógica de `RequestCreditsCheckout`, ver ticket 04) — grava `Checkout` com `status: PENDING` e retorna `checkoutUrl` junto dos tokens.

Isso substitui a decisão original ("signup não cria Checkout — compra é sempre um passo separado e opcional"). O motivo de reverter: reduzir fricção pra conversão, colocando o checkout na frente do usuário logo após o cadastro, sem torná-lo obrigatório.

Continua valendo que a compra **não é obrigatória**: se o usuário voltar da Stripe sem concluir o pagamento (ou nunca abrir o link), a conta já existe e funciona normalmente — ele só não terá crédito até completar uma compra (esse ou outro checkout, a qualquer momento, via `POST /credits/checkout`). Nenhuma rota de login ou navegação depende do `Checkout` criado no signup ter sido concluído.
