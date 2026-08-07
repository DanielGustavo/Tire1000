import { EssayEvaluation, type EssayEvaluationScores, type EssayHighlight } from "../../../../domain/entities/essay-evaluation.js";

export interface EssayEvaluationItem {
  PK: string;
  SK: string;
  GSI1PK: string;
  GSI1SK: string;
  id: string;
  type: "ESSAY_EVALUATION";
  essayId: string;
  scores: EssayEvaluationScores;
  highlights: EssayHighlight[];
  createdAt: string;
  updatedAt: string;
}

export function essayEvaluationPK(essayId: string): string {
  return `EVALUATION#${essayId}`;
}

export function essayEvaluationSK(essayId: string): string {
  return `EVALUATION#${essayId}`;
}

// Shared with Essay's GSI1PK — see essay-item.ts's essayGSI1PK — so both can be resolved by essayId.
export function essayEvaluationGSI1PK(essayId: string): string {
  return `ESSAY#${essayId}`;
}

// "EVALUATION#..." sorts after "ESSAY#..." in GSI1 (see spec's modelo de dados).
export function essayEvaluationGSI1SK(essayId: string): string {
  return `EVALUATION#${essayId}`;
}

export function toEssayEvaluationItem(essayEvaluation: EssayEvaluation): EssayEvaluationItem {
  return {
    PK: essayEvaluationPK(essayEvaluation.essayId),
    SK: essayEvaluationSK(essayEvaluation.essayId),
    GSI1PK: essayEvaluationGSI1PK(essayEvaluation.essayId),
    GSI1SK: essayEvaluationGSI1SK(essayEvaluation.essayId),
    id: essayEvaluation.id,
    type: essayEvaluation.type,
    essayId: essayEvaluation.essayId,
    scores: essayEvaluation.scores,
    highlights: essayEvaluation.highlights,
    createdAt: essayEvaluation.createdAt.toISOString(),
    updatedAt: essayEvaluation.updatedAt.toISOString(),
  };
}

export function fromEssayEvaluationItem(item: EssayEvaluationItem): EssayEvaluation {
  return EssayEvaluation.reconstitute({
    essayId: item.essayId,
    scores: item.scores,
    highlights: item.highlights,
    createdAt: new Date(item.createdAt),
    updatedAt: new Date(item.updatedAt),
  });
}
