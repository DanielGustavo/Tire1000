import type { Essay, EssayStatus } from "../../domain/entities/essay.js";
import type { EssayEvaluation, EssayEvaluationScores, EssayHighlight } from "../../domain/entities/essay-evaluation.js";

/**
 * Scoped to what a list of essays (GetEssayDetail's original ticket 06 scope, and ListUserEssays)
 * needs — id, status, rejection reasons, and the denormalized theme fields. See EssayDetailDTO for
 * the fuller shape GetEssayDetail returns since ticket 07 (textContent, highlights, scores).
 */
export interface EssayDTO {
  id: string;
  status: EssayStatus;
  rejectionReasons: string[];
  themeId: string;
  themeTitle: string;
  topicColor: string;
  /** Null for essays created before this denormalization shipped, or when the theme has no ENEM year. */
  enemYear: number | null;
  /** Null only for essays created before this denormalization shipped — gates whether the UI shows the ENEM/eixo badges at all. */
  topicTitle: string | null;
  finalScore: number | null;
  createdAt: string;
}

export function toEssayDTO(essay: Essay): EssayDTO {
  return {
    id: essay.id,
    status: essay.status,
    rejectionReasons: essay.rejectionReasons,
    themeId: essay.themeId,
    themeTitle: essay.themeTitle,
    topicColor: essay.topicColor,
    enemYear: essay.enemYear,
    topicTitle: essay.topicTitle,
    finalScore: essay.finalScore,
    createdAt: essay.createdAt.toISOString(),
  };
}

export interface EssayEvaluationDTO {
  scores: EssayEvaluationScores;
  highlights: EssayHighlight[];
}

export function toEssayEvaluationDTO(evaluation: EssayEvaluation): EssayEvaluationDTO {
  return { scores: evaluation.scores, highlights: evaluation.highlights };
}

/** GetEssayDetail's output (ticket 07, ADR-0012) — the list DTO plus the essay's text and, once Avaliação finishes, its evaluation. */
export interface EssayDetailDTO extends EssayDTO {
  textContent: string | null;
  evaluation: EssayEvaluationDTO | null;
}

export function toEssayDetailDTO(essay: Essay, evaluation: EssayEvaluation | null): EssayDetailDTO {
  return {
    ...toEssayDTO(essay),
    textContent: essay.textContent,
    evaluation: evaluation ? toEssayEvaluationDTO(evaluation) : null,
  };
}
