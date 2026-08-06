import { stripeWebhookAdapter } from "../../adapters/stripe-webhook-adapter.js";
import { StripeWebhookController } from "../../../application/controllers/credits/stripe-webhook-controller.js";
import { createConfirmCreditsCheckout } from "../../../application/use-cases/confirm-credits-checkout/confirm-credits-checkout.js";
import { StripePaymentGateway } from "../../../infra/gateways/stripe-payment-gateway.js";
import { DynamoCheckoutRepository } from "../../../infra/repositories/dynamo-checkout-repository.js";
import { DynamoUserRepository } from "../../../infra/repositories/dynamo-user-repository.js";

const confirmCreditsCheckout = createConfirmCreditsCheckout({
  paymentGateway: new StripePaymentGateway(),
  checkoutRepository: new DynamoCheckoutRepository(),
  userRepository: new DynamoUserRepository(),
});

export const handler = stripeWebhookAdapter(new StripeWebhookController(confirmCreditsCheckout));
