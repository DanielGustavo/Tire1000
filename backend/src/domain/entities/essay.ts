import { Entity } from "./entity.js";

export type EssayStatus =
  | "UPLOADING"
  | "QUEUED"
  | "UPLOAD_FAILED"
  | "VALIDATING"
  | "VALIDATION_FAILED"
  | "REJECTED"
  | "VALIDATED"
  | "EVALUATING"
  | "EVALUATION_FAILED"
  | "SUCCESS";

/**
 * Statuses a resend is allowed from: a fresh upload that never finished, one Revisão rejected or
 * failed by system error (both refund the credit), or one that reached QUEUED but couldn't be
 * debited (insufficient credits at confirmation time — never charged in the first place).
 */
export const RESENDABLE_ESSAY_STATUSES: EssayStatus[] = [
  "UPLOADING",
  "REJECTED",
  "UPLOAD_FAILED",
  "VALIDATION_FAILED",
];

export const REEVALUATABLE_ESSAY_STATUSES: EssayStatus[] = [
  "VALIDATED",
  "EVALUATING",
  "EVALUATION_FAILED",
];

/**
 * Statuses ValidateEssay will (re)process. Mirrors REEVALUATABLE_ESSAY_STATUSES's pattern by including
 * VALIDATION_FAILED, but this is a status-gate-only fix, not a functional redrive: unlike Avaliação,
 * where a terminal failure preserves `textContent` for reprocessing, `markValidationFailed` nulls
 * `fileKey` and ValidateEssay has already deleted the source photo from S3 and refunded the credit
 * (ADR-0001 — Revisão's recovery path is resend, not reprocess). So a VALIDATION_FAILED essay still hits
 * ValidateEssay's `fileKey` guard right after this check and gets skipped anyway. Making redrive actually
 * work would mean revisiting that fileKey/credit behavior, which is a separate decision from this fix.
 */
export const REVALIDATABLE_ESSAY_STATUSES: EssayStatus[] = [
  "QUEUED",
  "VALIDATING",
  "VALIDATION_FAILED",
];

export const ESSAY_PHOTO_MAX_SIZE_IN_BYTES = 10 * 1024 * 1024;

/** Credits debited from the owning user when an essay's upload is confirmed (see EnqueueEssayValidation). */
export const ESSAY_CREDIT_COST = 1;

/**
 * Mirrors the fila de Revisão's SQS RedrivePolicy (`maxReceiveCount: 3`, see sls/resources/essays.yml)
 * so ValidateEssay can recognize its own final attempt and do terminal bookkeeping (VALIDATION_FAILED,
 * refund, dev alert) on the same delivery SQS will use to move the message to the DLQ.
 */
export const MAX_ESSAY_VALIDATION_ATTEMPTS = 3;

/**
 * Mirrors the fila de Avaliação's SQS RedrivePolicy (`maxReceiveCount: 3`, see sls/resources/essays.yml)
 * — same reasoning as MAX_ESSAY_VALIDATION_ATTEMPTS, but for EvaluateEssay. Unlike Revisão, a terminal
 * failure here does **not** refund the credit (ADR-0001) — the essay is reprocessed via DLQ redrive
 * once the error is fixed, not resent by the user.
 */
export const MAX_ESSAY_EVALUATION_ATTEMPTS = 3;

/** Threshold from the spec: past this many lifetime rejections, the dev is alerted (no automatic action). */
export const ESSAY_REJECTED_ATTEMPTS_ALERT_THRESHOLD = 10;

export const ESSAY_REJECTION_REASONS = [
  "ILLEGIBLE_HANDWRITING",
  "LOW_LIGHTING",
  "TOO_FEW_LINES",
  "TOO_MANY_LINES",
  "NOT_AN_ESSAY",
  "BLURRY_PHOTO",
  "INCOMPLETE_PHOTO",
] as const;

export type EssayRejectionReason = (typeof ESSAY_REJECTION_REASONS)[number];

const ESSAY_FILE_KEY_PREFIX = "essays/";

/** Deterministic per-essay S3 key, reused across resends (the previous object is gone by then — see spec). */
export function essayFileKey(essayId: string): string {
  return `${ESSAY_FILE_KEY_PREFIX}${essayId}`;
}

/** Inverse of `essayFileKey`, used by EnqueueEssayValidation to recover the essayId from an S3 event. */
export function essayIdFromFileKey(fileKey: string): string | null {
  if (!fileKey.startsWith(ESSAY_FILE_KEY_PREFIX)) return null;
  const essayId = fileKey.slice(ESSAY_FILE_KEY_PREFIX.length);
  return essayId.length > 0 ? essayId : null;
}

export interface EssayProps {
  id: string;
  status: EssayStatus;
  validationAttempts: number;
  rejectedAttempts: number;
  rejectionReasons: string[];
  fileKey: string | null;
  textContent: string | null;
  evaluationAttempts: number;
  finalScore: number | null;
  userId: string;
  themeId: string;
  themeTitle: string;
  topicColor: string;
  /** Null for essays created before this denormalization shipped (no retroactive migration) or, for enemYear, when the theme itself has no ENEM year. */
  enemYear: number | null;
  /** Null only for essays created before this denormalization shipped — a new essay's topic always resolves. */
  topicTitle: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewEssayProps {
  id: string;
  fileKey: string;
  userId: string;
  themeId: string;
  themeTitle: string;
  topicColor: string;
  enemYear: number | null;
  topicTitle: string;
}

export class Essay extends Entity {
  declare readonly type: "ESSAY";

  status: EssayStatus;
  validationAttempts: number;
  rejectedAttempts: number;
  rejectionReasons: string[];
  fileKey: string | null;
  textContent: string | null;
  evaluationAttempts: number;
  finalScore: number | null;
  readonly userId: string;
  readonly themeId: string;
  readonly themeTitle: string;
  readonly topicColor: string;
  readonly enemYear: number | null;
  readonly topicTitle: string | null;

  private constructor(props: EssayProps) {
    super({
      id: props.id,
      type: "ESSAY",
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });
    this.status = props.status;
    this.validationAttempts = props.validationAttempts;
    this.rejectedAttempts = props.rejectedAttempts;
    this.rejectionReasons = props.rejectionReasons;
    this.fileKey = props.fileKey;
    this.textContent = props.textContent;
    this.evaluationAttempts = props.evaluationAttempts;
    this.finalScore = props.finalScore;
    this.userId = props.userId;
    this.themeId = props.themeId;
    this.themeTitle = props.themeTitle;
    this.topicColor = props.topicColor;
    this.enemYear = props.enemYear;
    this.topicTitle = props.topicTitle;
  }

  static create({
    id,
    fileKey,
    userId,
    themeId,
    themeTitle,
    topicColor,
    enemYear,
    topicTitle,
  }: NewEssayProps): Essay {
    const now = new Date();
    return new Essay({
      id,
      status: "UPLOADING",
      validationAttempts: 0,
      rejectedAttempts: 0,
      rejectionReasons: [],
      fileKey,
      textContent: null,
      evaluationAttempts: 0,
      finalScore: null,
      userId,
      themeId,
      themeTitle,
      topicColor,
      enemYear,
      topicTitle,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: EssayProps): Essay {
    return new Essay(props);
  }

  /** Reenvio (ticket 05): back to UPLOADING with a fresh upload target, previous OCR text discarded. */
  resetForResend(fileKey: string): void {
    this.status = "UPLOADING";
    this.fileKey = fileKey;
    this.textContent = null;
    this.updatedAt = new Date();
  }

  /** S3 confirmed the photo landed in the bucket — ready for the fila de Revisão. */
  markQueued(): void {
    this.status = "QUEUED";
    this.updatedAt = new Date();
  }

  /** Reached QUEUED but the credit debit lost the race against the user's balance — needs a reenvio. */
  markUploadFailed(): void {
    this.status = "UPLOAD_FAILED";
    this.updatedAt = new Date();
  }

  /**
   * Start (or retry) a Revisão attempt. Called once per SQS delivery of the fila de Revisão message —
   * `validationAttempts` mirrors the delivery count so ValidateEssay can recognize its own last attempt
   * (see MAX_ESSAY_VALIDATION_ATTEMPTS) without depending on SQS's own opaque receive count. Also clears
   * `rejectionReasons` from any earlier REJECTED cycle — a fresh attempt supersedes them, and leaving
   * them in place would leak stale reasons through VALIDATING/VALIDATED/VALIDATION_FAILED until the next
   * rejection overwrites them.
   */
  markValidating(): void {
    this.status = "VALIDATING";
    this.validationAttempts += 1;
    this.rejectionReasons = [];
    this.updatedAt = new Date();
  }

  /** Gemini returned OCR'd text — Revisão passed, photo no longer needed. */
  markValidated(textContent: string): void {
    this.status = "VALIDATED";
    this.textContent = textContent;
    this.fileKey = null;
    this.updatedAt = new Date();
  }

  /** Gemini rejected the photo (legibility/lighting/line count) — refundable, resendable. */
  markRejected(reasons: EssayRejectionReason[]): void {
    this.status = "REJECTED";
    this.rejectedAttempts += 1;
    this.validationAttempts = 0;
    this.rejectionReasons = reasons;
    this.fileKey = null;
    this.updatedAt = new Date();
  }

  /**
   * Terminal system failure — the MAX_ESSAY_VALIDATION_ATTEMPTS-th attempt also failed. `validationAttempts`
   * resets same as a rejection: a resend starts a fresh Revisão cycle and must not immediately look
   * like it's already exhausted its attempts.
   */
  markValidationFailed(): void {
    this.status = "VALIDATION_FAILED";
    this.validationAttempts = 0;
    this.fileKey = null;
    this.updatedAt = new Date();
  }

  /**
   * Start (or retry) an Avaliação attempt. Called once per SQS delivery of the fila de Avaliação
   * message — same reasoning as `markValidating`, `evaluationAttempts` mirrors delivery count.
   */
  markEvaluating(): void {
    this.status = "EVALUATING";
    this.evaluationAttempts += 1;
    this.updatedAt = new Date();
  }

  /** Gemini scored all 5 competências — Avaliação (and the whole Correção) is done. */
  markEvaluated(finalScore: number): void {
    this.status = "SUCCESS";
    this.finalScore = finalScore;
    this.updatedAt = new Date();
  }

  /**
   * Terminal system failure — the MAX_ESSAY_EVALUATION_ATTEMPTS-th attempt also failed. No credit
   * refund (ADR-0001): the fix is reprocessing this same essay from its already-extracted textContent
   * after the team repairs the error, not a resend. `evaluationAttempts` resets so that reprocessing
   * (status flipped back to VALIDATED as part of the manual fix) starts a fresh attempt count.
   */
  markEvaluationFailed(): void {
    this.status = "EVALUATION_FAILED";
    this.evaluationAttempts = 0;
    this.updatedAt = new Date();
  }
}
