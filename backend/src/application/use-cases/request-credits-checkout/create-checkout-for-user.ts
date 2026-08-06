import { Checkout } from "../../../domain/entities/checkout.js";
import type { IdGenerator } from "../../../domain/contracts/gateways/id-generator.js";
import type { PaymentGateway } from "../../../domain/contracts/gateways/payment-gateway.js";
import type { CheckoutRepository } from "../../../domain/contracts/repositories/checkout-repository.js";

export interface CreateCheckoutForUserDeps {
  checkoutRepository: CheckoutRepository;
  paymentGateway: PaymentGateway;
  idGenerator: IdGenerator;
}

export interface CreateCheckoutForUserInput {
  userId: string;
  creditsQty: number;
}

export interface CreateCheckoutForUserOutput {
  checkoutUrl: string;
}

/**
 * Shared by RequestCreditsCheckout (the standalone `/credits/checkout` endpoint) and
 * SignUpUser (the automatic checkout created at signup, see ADR-0005) — both create a
 * Stripe Checkout Session and persist a matching PENDING Checkout the same way.
 */
export async function createCheckoutForUser(
  { checkoutRepository, paymentGateway, idGenerator }: CreateCheckoutForUserDeps,
  { userId, creditsQty }: CreateCheckoutForUserInput,
): Promise<CreateCheckoutForUserOutput> {
  const { externalId, checkoutUrl } = await paymentGateway.createCheckoutSession({ userId, creditsQty });

  const checkout = Checkout.create({ id: await idGenerator.generate(), externalId, creditsQty, userId });
  await checkoutRepository.create(checkout);

  return { checkoutUrl };
}
