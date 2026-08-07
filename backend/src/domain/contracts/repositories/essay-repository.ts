import type { Essay, EssayStatus } from "../../entities/essay.js";
import type { EssayEvaluation } from "../../entities/essay-evaluation.js";

export interface EssayWithEvaluation {
  essay: Essay;
  evaluation: EssayEvaluation | null;
}

export interface EssayRepository {
  create(essay: Essay): Promise<Essay>;
  /** Resolved by essayId alone (GSI1), independent of the owning userId — see spec's model. */
  findById(essayId: string): Promise<Essay | null>;
  /**
   * Same GSI1 lookup as `findById`, but also returns the essay's EssayEvaluation when one exists —
   * Essay and EssayEvaluation share GSI1PK (`ESSAY#<essayId>`) by design (see spec's modelo de
   * dados), so this is one Query instead of a Query + a separate GetItem. Used by GetEssayDetail,
   * the only caller that ever needs both together; state-machine use cases keep using `findById`.
   */
  findByIdWithEvaluation(essayId: string): Promise<EssayWithEvaluation | null>;
  /** Every essay the user has sent, most recent submission first (KSUID ids sort chronologically). */
  listByUserId(userId: string): Promise<Essay[]>;
  /**
   * Persists essay's current status/fileKey/textContent/updatedAt, conditioned on the stored
   * status still being `expectedCurrentStatus`. `applied: false` means the stored status had
   * already moved on — e.g. a duplicate S3 event redelivery, or a concurrent resend — callers
   * must treat that as a no-op, not an error (mirrors CheckoutRepository#updateStatus/ADR-0007).
   */
  updateStatus(essay: Essay, options: { expectedCurrentStatus: EssayStatus }): Promise<{ applied: boolean }>;
}
