import { Checkout, type CheckoutStatus } from "../../../domain/entities/checkout.js";
import type { CheckoutRepository } from "../../../domain/contracts/repositories/checkout-repository.js";

// Checkout is mutable (see Checkout#complete). A real store never hands out the same object
// reference it persisted — every read/write round-trips through (de)serialization — so this fake
// clones on the way in and out too, or a caller mutating its own Checkout would silently mutate
// "storage" before the guarded updateStatus call runs.
function cloneCheckout(checkout: Checkout): Checkout {
  return Checkout.reconstitute({
    id: checkout.id,
    externalId: checkout.externalId,
    gateway: checkout.gateway,
    status: checkout.status,
    amountInCents: checkout.amountInCents,
    creditsQty: checkout.creditsQty,
    userId: checkout.userId,
    createdAt: checkout.createdAt,
    updatedAt: checkout.updatedAt,
  });
}

export class InMemoryCheckoutRepository implements CheckoutRepository {
  private readonly checkoutsByExternalId = new Map<string, Checkout>();

  async create(checkout: Checkout): Promise<Checkout> {
    this.checkoutsByExternalId.set(checkout.externalId, cloneCheckout(checkout));
    return checkout;
  }

  async findByExternalId(externalId: string): Promise<Checkout | null> {
    const stored = this.checkoutsByExternalId.get(externalId);
    return stored ? cloneCheckout(stored) : null;
  }

  async updateStatus(checkout: Checkout, { expectedCurrentStatus }: { expectedCurrentStatus: CheckoutStatus }): Promise<{ applied: boolean }> {
    const current = this.checkoutsByExternalId.get(checkout.externalId);
    if (!current || current.status !== expectedCurrentStatus) return { applied: false };

    this.checkoutsByExternalId.set(checkout.externalId, cloneCheckout(checkout));
    return { applied: true };
  }
}
