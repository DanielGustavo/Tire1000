import type { IdGenerator } from "../../../domain/contracts/gateways/id-generator.js";
import type { PaymentGateway } from "../../../domain/contracts/gateways/payment-gateway.js";
import type { CheckoutRepository } from "../../../domain/contracts/repositories/checkout-repository.js";
import type { UserRepository } from "../../../domain/contracts/repositories/user-repository.js";
import { NotFoundError } from "../../../shared/errors/not-found-error.js";
import { createCheckoutForUser, type CreateCheckoutForUserOutput } from "./create-checkout-for-user.js";

export interface RequestCreditsCheckoutDeps {
  userRepository: UserRepository;
  checkoutRepository: CheckoutRepository;
  paymentGateway: PaymentGateway;
  idGenerator: IdGenerator;
}

export interface RequestCreditsCheckoutInput {
  externalId: string;
  creditsQty: number;
}

export type RequestCreditsCheckoutOutput = CreateCheckoutForUserOutput;

export function createRequestCreditsCheckout(deps: RequestCreditsCheckoutDeps) {
  return async function requestCreditsCheckout({
    externalId,
    creditsQty,
  }: RequestCreditsCheckoutInput): Promise<RequestCreditsCheckoutOutput> {
    const user = await deps.userRepository.findByExternalId(externalId);
    if (!user) throw new NotFoundError("Usuário não encontrado");

    return createCheckoutForUser(deps, { userId: user.id, creditsQty });
  };
}
