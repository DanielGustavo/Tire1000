import type { ReactNode } from "react";
import { Bullet } from "../../../components/Bullet";
import { TexturedCard } from "../../../components/TexturedCard";
import { COMPETENCY_COLORS, type CompetencyId } from "../../../services/essay-service";

type CompetencyScoreCardProps = {
  competencyId: CompetencyId;
  /** The number from the real evaluation, or "???" for the pending skeleton. */
  score: ReactNode;
  text: string;
  /** Set by CompetencyScoresSkeleton — the card is purely decorative there (real status text lives in PendingResult's sticky note). */
  ariaHidden?: boolean;
  /** Set by CompetencyScoresSkeleton — bolds the placeholder message so it doesn't read as body copy. */
  bold?: boolean;
};

/** One C1-C5 score card, shared by the real result (`CompetencyScores`) and the pending-state placeholder (`CompetencyScoresSkeleton`). */
export function CompetencyScoreCard({ competencyId, score, text, ariaHidden, bold }: CompetencyScoreCardProps) {
  return (
    <div aria-hidden={ariaHidden} className="flex w-full flex-col items-start gap-2">
      <Bullet size="auto" color={COMPETENCY_COLORS[competencyId]}>
        {competencyId}
      </Bullet>
      <TexturedCard color={COMPETENCY_COLORS[competencyId]} texture={false} className="w-full" contentClassName="items-end gap-4 p-2.5">
        <div className="flex w-full items-start gap-4">
          <Bullet variant="white" size="auto" rotate="left">
            {score}
          </Bullet>
          <p className={`flex-1 text-default text-neutral-900 ${bold ? "font-bold" : ""}`}>{text}</p>
        </div>
      </TexturedCard>
    </div>
  );
}
