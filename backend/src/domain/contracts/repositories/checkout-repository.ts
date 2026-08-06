import type { Checkout, CheckoutStatus } from "../../entities/checkout.js";

export interface CheckoutRepository {
  create(checkout: Checkout): Promise<Checkout>;
  findByExternalId(externalId: string): Promise<Checkout | null>;
  /**
   * Persists checkout's current status/amountInCents/updatedAt (see e.g. Checkout#complete),
   * conditioned on the stored status still being `expectedCurrentStatus`. `applied: false` means
   * the stored status had already moved on — e.g. another delivery of the same webhook event
   * already applied this transition — callers must treat that as a no-op, not an error (ADR-0007).
   */
  updateStatus(checkout: Checkout, options: { expectedCurrentStatus: CheckoutStatus }): Promise<{ applied: boolean }>;
}
