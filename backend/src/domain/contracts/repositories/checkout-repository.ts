import type { Checkout } from "../../entities/checkout.js";

export interface CheckoutRepository {
  create(checkout: Checkout): Promise<Checkout>;
  findByExternalId(externalId: string): Promise<Checkout | null>;
  /**
   * Persists a checkout already transitioned to COMPLETED (see Checkout#complete), conditioned
   * on it still being PENDING in storage. `applied: false` means another delivery of the same
   * webhook event already completed it — callers must treat that as a no-op, not an error.
   */
  complete(checkout: Checkout): Promise<{ applied: boolean }>;
}
