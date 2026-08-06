import { describe, expect, it } from "vitest";
import { Checkout } from "../../../domain/entities/checkout.js";
import { User } from "../../../domain/entities/user.js";
import { InvalidWebhookSignatureError } from "../../../domain/contracts/gateways/payment-gateway.js";
import { InMemoryPaymentGateway } from "../../../infra/gateways/fakes/in-memory-payment-gateway.js";
import { InMemoryCheckoutRepository } from "../../../infra/repositories/fakes/in-memory-checkout-repository.js";
import { InMemoryUserRepository } from "../../../infra/repositories/fakes/in-memory-user-repository.js";
import { NotFoundError } from "../../../shared/errors/not-found-error.js";
import { createConfirmCreditsCheckout } from "./confirm-credits-checkout.js";

async function buildDeps() {
  const userRepository = new InMemoryUserRepository();
  const user = User.create({ id: "user-1", externalId: "sub-1", email: "student@example.com", name: "Student" });
  await userRepository.create(user);

  const checkoutRepository = new InMemoryCheckoutRepository();
  const checkout = Checkout.create({ id: "checkout-1", externalId: "session-1", creditsQty: 10, userId: "user-1" });
  await checkoutRepository.create(checkout);

  return { userRepository, checkoutRepository, paymentGateway: new InMemoryPaymentGateway(), user, checkout };
}

describe("ConfirmCreditsCheckout", () => {
  it("credits the user with creditsQty and completes the Checkout using the gateway's amountInCents", async () => {
    const deps = await buildDeps();
    const confirmCreditsCheckout = createConfirmCreditsCheckout(deps);
    const webhook = deps.paymentGateway.buildCheckoutCompletedWebhook({ externalId: "session-1", amountInCents: 5000 });

    const result = await confirmCreditsCheckout(webhook);

    expect(result).toEqual({ confirmed: true });
    await expect(deps.userRepository.findById("user-1")).resolves.toMatchObject({ credits: 10 });
    await expect(deps.checkoutRepository.findByExternalId("session-1")).resolves.toMatchObject({
      status: "COMPLETED",
      amountInCents: 5000,
    });
  });

  it("ignores any amountInCents the client might try to pass and only trusts the gateway's event", async () => {
    const deps = await buildDeps();
    const confirmCreditsCheckout = createConfirmCreditsCheckout(deps);
    const webhook = deps.paymentGateway.buildCheckoutCompletedWebhook({ externalId: "session-1", amountInCents: 5000 });

    await confirmCreditsCheckout(webhook);

    const checkout = await deps.checkoutRepository.findByExternalId("session-1");
    expect(checkout?.amountInCents).toBe(5000);
  });

  it("throws InvalidWebhookSignatureError and does not credit the user when the signature is invalid", async () => {
    const deps = await buildDeps();
    const confirmCreditsCheckout = createConfirmCreditsCheckout(deps);

    await expect(
      confirmCreditsCheckout({ payload: JSON.stringify({}), signature: "not-the-right-signature" }),
    ).rejects.toThrow(InvalidWebhookSignatureError);
    await expect(deps.userRepository.findById("user-1")).resolves.toMatchObject({ credits: 0 });
  });

  it("throws NotFoundError when the event references a Checkout that was never created", async () => {
    const deps = await buildDeps();
    const confirmCreditsCheckout = createConfirmCreditsCheckout(deps);
    const webhook = deps.paymentGateway.buildCheckoutCompletedWebhook({ externalId: "unknown-session", amountInCents: 5000 });

    await expect(confirmCreditsCheckout(webhook)).rejects.toThrow(NotFoundError);
  });

  it("is idempotent: replaying the same webhook event does not credit the user twice", async () => {
    const deps = await buildDeps();
    const confirmCreditsCheckout = createConfirmCreditsCheckout(deps);
    const webhook = deps.paymentGateway.buildCheckoutCompletedWebhook({ externalId: "session-1", amountInCents: 5000 });

    await confirmCreditsCheckout(webhook);
    const secondResult = await confirmCreditsCheckout(webhook);

    expect(secondResult).toEqual({ confirmed: true });
    await expect(deps.userRepository.findById("user-1")).resolves.toMatchObject({ credits: 10 });
  });

  it("returns confirmed: false and does not touch credits for event types the app doesn't act on", async () => {
    const deps = await buildDeps();
    const confirmCreditsCheckout = createConfirmCreditsCheckout(deps);

    const result = await confirmCreditsCheckout(deps.paymentGateway.buildIgnoredWebhook());

    expect(result).toEqual({ confirmed: false });
    await expect(deps.userRepository.findById("user-1")).resolves.toMatchObject({ credits: 0 });
  });
});
