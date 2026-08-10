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

export interface Essay {
  id: string;
  status: EssayStatus;
  rejectionReasons: string[];
  themeId: string;
  themeTitle: string;
  topicColor: string;
  /** Null for essays created before this denormalization shipped, or when the theme has no ENEM year. */
  enemYear: number | null;
  /** Null only for essays created before this denormalization shipped — gates whether the ENEM/eixo badges show at all. */
  topicTitle: string | null;
  finalScore: number | null;
  createdAt: string;
}

export type CompetencyId = "C1" | "C2" | "C3" | "C4" | "C5";

export interface CompetencyScore {
  score: number;
  evaluationText: string;
}

export type EssayEvaluationScores = Record<CompetencyId, CompetencyScore> & { final: CompetencyScore };

export interface EssayHighlight {
  type: CompetencyId;
  anchorIndex: number;
  endIndex: number;
  /** Comentário do avaliador explicando por que esse trecho tirou nota ou merece atenção — mostrado ao passar o mouse sobre o destaque. */
  textContent: string;
}

export interface EssayEvaluation {
  scores: EssayEvaluationScores;
  highlights: EssayHighlight[];
}

export interface EssayDetail extends Essay {
  textContent: string | null;
  evaluation: EssayEvaluation | null;
}
