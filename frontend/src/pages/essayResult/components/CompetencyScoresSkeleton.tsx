import { COMPETENCY_IDS, pendingResultHeading } from "../../../services/essayService";
import type { EssayStatus } from "../../../types/essay";
import { CompetencyScoreCard } from "./CompetencyScoreCard";
import { FinalScoreCard } from "./FinalScoreCard";

/**
 * Desktop-only placeholder for the score sidebar while the essay is still pending. The Figma "Correção -
 * in progress"/"loading" frames show the same C1-C5 + Nota final shape as the real result (`CompetencyScores`),
 * just with "???" scores in place of numbers — there's no mobile equivalent (ticket 07 kept the mobile
 * pending state to just PendingResult's sticky note), so the parent only mounts this at `lg:`.
 *
 * Purely decorative — the real status text already lives in PendingResult's sticky note — so every card
 * here is `aria-hidden`.
 */
export function CompetencyScoresSkeleton({ status }: { status: EssayStatus }) {
  const message = `${pendingResultHeading(status)}...`;

  return (
    <>
      {COMPETENCY_IDS.map((competencyId) => (
        <CompetencyScoreCard key={competencyId} competencyId={competencyId} score="???" text={message} ariaHidden bold />
      ))}
      <FinalScoreCard score="???" text={message} ariaHidden bold />
    </>
  );
}
