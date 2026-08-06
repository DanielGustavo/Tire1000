import type { Essay, EssayStatus } from "../../entities/essay.js";

export interface EssayRepository {
  create(essay: Essay): Promise<Essay>;
  /** Resolved by essayId alone (GSI1), independent of the owning userId — see spec's model. */
  findById(essayId: string): Promise<Essay | null>;
  /**
   * Persists essay's current status/fileKey/textContent/updatedAt, conditioned on the stored
   * status still being `expectedCurrentStatus`. `applied: false` means the stored status had
   * already moved on — e.g. a duplicate S3 event redelivery, or a concurrent resend — callers
   * must treat that as a no-op, not an error (mirrors CheckoutRepository#updateStatus/ADR-0007).
   */
  updateStatus(essay: Essay, options: { expectedCurrentStatus: EssayStatus }): Promise<{ applied: boolean }>;
}
