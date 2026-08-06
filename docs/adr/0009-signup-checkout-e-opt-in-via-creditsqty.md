# Checkout do signup é opt-in via `creditsQty`, sem quantidade default

Substitui a [ADR-0005](./0005-signup-cria-checkout-automatico.md).

A ADR-0005 fazia `SignUpUser` criar sempre um Checkout Stripe pra um pacote inicial fixo de créditos (`DEFAULT_SIGNUP_CREDITS_QTY = 5`), hardcoded no use case, independente do que o caller pedisse — porque não havia como o caller pedir nada, o input do signup nunca teve esse campo.

`SignUpUserInput` ganhou `creditsQty?: number`. O caller (frontend) decide se oferece a compra inicial e com qual quantidade; o backend não impõe mais um valor. Sem `creditsQty` (omitido ou `0`), nenhum Checkout é criado e `checkoutUrl` volta `null` — não é erro, é o caminho normal de quem não quis comprar créditos no cadastro. Valores negativos ou não inteiros são rejeitados na validação do schema (`creditsQty` segue o mesmo formato de `RequestCreditsCheckoutSchema`, mas com `.nonnegative()` em vez de `.positive()`, já que aqui `0` é um valor válido de "não comprar").

Continua valendo o resto da ADR-0005: a compra é opcional (a conta funciona sem ela) e uma falha do Stripe ao criar o checkout não derruba o signup — o erro é logado e `checkoutUrl` volta `null`, permitindo tentar de novo depois via `POST /credits/checkout`.
