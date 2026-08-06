import type { Checkout } from "../../../domain/entities/checkout.js";
import type { CheckoutRepository } from "../../../domain/contracts/repositories/checkout-repository.js";

export class InMemoryCheckoutRepository implements CheckoutRepository {
  private readonly checkoutsByExternalId = new Map<string, Checkout>();

  async create(checkout: Checkout): Promise<Checkout> {
    this.checkoutsByExternalId.set(checkout.externalId, checkout);
    return checkout;
  }

  async findByExternalId(externalId: string): Promise<Checkout | null> {
    return this.checkoutsByExternalId.get(externalId) ?? null;
  }

  async complete(checkout: Checkout): Promise<{ applied: boolean }> {
    const current = this.checkoutsByExternalId.get(checkout.externalId);
    if (!current || current.status !== "PENDING") return { applied: false };

    this.checkoutsByExternalId.set(checkout.externalId, checkout);
    return { applied: true };
  }
}
