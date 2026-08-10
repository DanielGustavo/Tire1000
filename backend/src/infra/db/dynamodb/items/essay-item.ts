import { Essay, type EssayStatus } from "../../../../domain/entities/essay.js";

export interface EssayItem {
  PK: string;
  SK: string;
  GSI1PK: string;
  GSI1SK: string;
  id: string;
  type: "ESSAY";
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
  enemYear: number | null;
  topicTitle: string | null;
  createdAt: string;
  updatedAt: string;
}

export function essayPK(userId: string): string {
  return `USER#${userId}`;
}

export function essaySK(essayId: string): string {
  return `ESSAY#${essayId}`;
}

// Shared with EssayEvaluation's GSI1PK — a single GSI1 query resolves an essay and its evaluation together.
export function essayGSI1PK(essayId: string): string {
  return `ESSAY#${essayId}`;
}

export function essayGSI1SK(essayId: string): string {
  return `ESSAY#${essayId}`;
}

export function toEssayItem(essay: Essay): EssayItem {
  return {
    PK: essayPK(essay.userId),
    SK: essaySK(essay.id),
    GSI1PK: essayGSI1PK(essay.id),
    GSI1SK: essayGSI1SK(essay.id),
    id: essay.id,
    type: essay.type,
    status: essay.status,
    validationAttempts: essay.validationAttempts,
    rejectedAttempts: essay.rejectedAttempts,
    rejectionReasons: essay.rejectionReasons,
    fileKey: essay.fileKey,
    textContent: essay.textContent,
    evaluationAttempts: essay.evaluationAttempts,
    finalScore: essay.finalScore,
    userId: essay.userId,
    themeId: essay.themeId,
    themeTitle: essay.themeTitle,
    topicColor: essay.topicColor,
    enemYear: essay.enemYear,
    topicTitle: essay.topicTitle,
    createdAt: essay.createdAt.toISOString(),
    updatedAt: essay.updatedAt.toISOString(),
  };
}

export function fromEssayItem(item: EssayItem): Essay {
  return Essay.reconstitute({
    id: item.id,
    status: item.status,
    validationAttempts: item.validationAttempts,
    rejectedAttempts: item.rejectedAttempts,
    rejectionReasons: item.rejectionReasons,
    fileKey: item.fileKey,
    textContent: item.textContent,
    evaluationAttempts: item.evaluationAttempts,
    finalScore: item.finalScore,
    userId: item.userId,
    themeId: item.themeId,
    themeTitle: item.themeTitle,
    topicColor: item.topicColor,
    // Legacy items predate these attributes and have neither in DynamoDB (undefined, not null).
    enemYear: item.enemYear ?? null,
    topicTitle: item.topicTitle ?? null,
    createdAt: new Date(item.createdAt),
    updatedAt: new Date(item.updatedAt),
  });
}
