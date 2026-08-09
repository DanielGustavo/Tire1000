import { COMPETENCY_IDS } from "../../../services/essay-service";
import type { EssayEvaluation } from "../../../types/essay";
import { CompetencyScoreCard } from "./CompetencyScoreCard";
import { FinalScoreCard } from "./FinalScoreCard";

/**
 * The per-competência (C1-C5) score cards plus the final score card — the score sidebar of the Correção
 * result. Rendered as a flat list of flex children (no wrapping element) so the parent controls layout:
 * stacked below the essay text on mobile, a fixed-width column beside it on desktop (ticket 13).
 */
export function CompetencyScores({ evaluation }: { evaluation: EssayEvaluation }) {
  return (
    <>
      {COMPETENCY_IDS.map((competencyId) => (
        <CompetencyScoreCard
          key={competencyId}
          competencyId={competencyId}
          score={evaluation.scores[competencyId].score}
          text={evaluation.scores[competencyId].evaluationText}
        />
      ))}
      <FinalScoreCard score={evaluation.scores.final.score} text={evaluation.scores.final.evaluationText} />
    </>
  );
}
