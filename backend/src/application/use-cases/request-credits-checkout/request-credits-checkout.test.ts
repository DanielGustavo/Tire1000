import { describe, expect, it } from "vitest";
import { User } from "../../../domain/entities/user.js";
import { InMemoryCheckoutRepository } from "../../../infra/repositories/fakes/in-memory-checkout-repository.js";
import { InMemoryUserRepository } from "../../../infra/repositories/fakes/in-memory-user-repository.js";
import { InMemoryPaymentGateway } from "../../../infra/gateways/fakes/in-memory-payment-gateway.js";
import { SequentialIdGenerator } from "../../../infra/gateways/fakes/sequential-id-generator.js";
import { NotFoundError } from "../../../shared/errors/not-found-error.js";
import { createRequestCreditsCheckout } from "./request-credits-checkout.js";

async function buildDeps() {
  const userRepository = new InMemoryUserRepository();
  const user = User.create({ id: "user-1", externalId: "sub-1", email: "student@example.com", name: "Student" });
  await userRepository.create(user);

  return {
    userRepository,
    checkoutRepository: new InMemoryCheckoutRepository(),
    paymentGateway: new InMemoryPaymentGateway(),
    idGenerator: new SequentialIdGenerator(),
    user,
  };
}

describe("RequestCreditsCheckout", () => {
  it("creates a Stripe Checkout Session with quantity = creditsQty and returns its URL", async () => {
    const deps = await buildDeps();
    const requestCreditsCheckout = createRequestCreditsCheckout(deps);

    const result = await requestCreditsCheckout({ externalId: "sub-1", creditsQty: 10 });

    expect(result).toEqual({ checkoutUrl: "https://checkout.stripe.test/fake-checkout-session-1" });
    expect(deps.paymentGateway.createdSessions).toEqual([{ userId: "user-1", creditsQty: 10 }]);
  });

  it("persists a PENDING Checkout tied to the resolved user", async () => {
    const deps = await buildDeps();
    const requestCreditsCheckout = createRequestCreditsCheckout(deps);

    await requestCreditsCheckout({ externalId: "sub-1", creditsQty: 10 });

    await expect(deps.checkoutRepository.findByExternalId("fake-checkout-session-1")).resolves.toMatchObject({
      externalId: "fake-checkout-session-1",
      gateway: "STRIPE",
      status: "PENDING",
      amountInCents: null,
      creditsQty: 10,
      userId: "user-1",
    });
  });

  it("throws NotFoundError when the authenticated user has no matching User record", async () => {
    const deps = await buildDeps();
    const requestCreditsCheckout = createRequestCreditsCheckout(deps);

    await expect(requestCreditsCheckout({ externalId: "missing-sub", creditsQty: 10 })).rejects.toThrow(NotFoundError);
    expect(deps.paymentGateway.createdSessions).toEqual([]);
  });
});
