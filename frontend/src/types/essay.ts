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
