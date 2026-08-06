import type { PaymentGateway } from "../../../domain/contracts/gateways/payment-gateway.js";
import type { CheckoutRepository } from "../../../domain/contracts/repositories/checkout-repository.js";
import type { UserRepository } from "../../../domain/contracts/repositories/user-repository.js";
import { NotFoundError } from "../../../shared/errors/not-found-error.js";

export interface ConfirmCreditsCheckoutDeps {
  paymentGateway: PaymentGateway;
  checkoutRepository: CheckoutRepository;
  userRepository: UserRepository;
}

export interface ConfirmCreditsCheckoutInput {
  payload: string;
  signature: string;
}

export interface ConfirmCreditsCheckoutOutput {
  confirmed: boolean;
}

export function createConfirmCreditsCheckout({ paymentGateway, checkoutRepository, userRepository }: ConfirmCreditsCheckoutDeps) {
  return async function confirmCreditsCheckout({
    payload,
    signature,
  }: ConfirmCreditsCheckoutInput): Promise<ConfirmCreditsCheckoutOutput> {
    const event = paymentGateway.parseWebhookEvent({ payload, signature });
    if (event.type !== "CHECKOUT_COMPLETED") return { confirmed: false };

    const checkout = await checkoutRepository.findByExternalId(event.externalId);
    if (!checkout) throw new NotFoundError("Checkout não encontrado");

    // Conditioned on the checkout still being PENDING in storage: if another delivery of the
    // same webhook event already completed it, `applied` comes back false and we must not
    // credit the user twice (ADR-0007).
    checkout.complete({ amountInCents: event.amountInCents });
    const { applied } = await checkoutRepository.updateStatus(checkout, { expectedCurrentStatus: "PENDING" });
    if (!applied) return { confirmed: true };

    await userRepository.incrementCredits(checkout.userId, checkout.creditsQty);

    return { confirmed: true };
  };
}
