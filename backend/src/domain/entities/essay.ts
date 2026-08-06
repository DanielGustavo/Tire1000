import { Entity } from "./entity.js";

export type EssayStatus =
  | "UPLOADING"
  | "QUEUED"
  | "VALIDATING"
  | "VALIDATION_FAILED"
  | "REJECTED"
  | "VALIDATED"
  | "EVALUATING"
  | "EVALUATION_FAILED"
  | "SUCCESS";

/** Statuses a resend is allowed from: a fresh upload that never finished, or one Revisão rejected. */
export const RESENDABLE_ESSAY_STATUSES: EssayStatus[] = ["UPLOADING", "REJECTED"];

export const ESSAY_PHOTO_MAX_SIZE_IN_BYTES = 10 * 1024 * 1024;

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

  private constructor(props: EssayProps) {
    super({ id: props.id, type: "ESSAY", createdAt: props.createdAt, updatedAt: props.updatedAt });
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
  }

  static create({ id, fileKey, userId, themeId, themeTitle, topicColor }: NewEssayProps): Essay {
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
}
