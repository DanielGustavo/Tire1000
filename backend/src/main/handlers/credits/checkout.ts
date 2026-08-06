import { apigwAdapter } from "../../adapters/apigw-adapter.js";
import { RequestCreditsCheckoutController } from "../../../application/controllers/credits/request-credits-checkout-controller.js";
import { createRequestCreditsCheckout } from "../../../application/use-cases/request-credits-checkout/request-credits-checkout.js";
import { StripePaymentGateway } from "../../../infra/gateways/stripe-payment-gateway.js";
import { KsuidIdGenerator } from "../../../infra/gateways/ksuid-id-generator.js";
import { DynamoCheckoutRepository } from "../../../infra/repositories/dynamo-checkout-repository.js";
import { DynamoUserRepository } from "../../../infra/repositories/dynamo-user-repository.js";

const requestCreditsCheckout = createRequestCreditsCheckout({
  userRepository: new DynamoUserRepository(),
  checkoutRepository: new DynamoCheckoutRepository(),
  paymentGateway: new StripePaymentGateway(),
  idGenerator: new KsuidIdGenerator(),
});

export const handler = apigwAdapter(new RequestCreditsCheckoutController(requestCreditsCheckout));
