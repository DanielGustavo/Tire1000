import type { ReactNode } from "react";
import { Bullet } from "../../../components/Bullet";
import { LINE_HEIGHT_PX, PaperCard } from "../../../components/PaperCard";
import { scoreCardColor } from "../../../services/essayService";

type FinalScoreCardProps = {
  /** The number from the real evaluation, or "???" for the pending skeleton. */
  score: ReactNode;
  text: string;
  /** Set by CompetencyScoresSkeleton — the card is purely decorative there (real status text lives in PendingResult's sticky note). */
  ariaHidden?: boolean;
  /** Set by CompetencyScoresSkeleton — bolds the placeholder message so it doesn't read as body copy. */
  bold?: boolean;
};

/** The "Nota final" card, shared by the real result (`CompetencyScores`) and the pending-state placeholder (`CompetencyScoresSkeleton`). */
export function FinalScoreCard({ score, text, ariaHidden, bold }: FinalScoreCardProps) {
  return (
    <div aria-hidden={ariaHidden} className="flex w-full flex-col items-start gap-2">
      <Bullet variant="dark-outline" size="auto">
        Nota final
      </Bullet>
      <PaperCard>
        <div className="flex w-full items-start gap-4">
          <Bullet color={typeof score === "number" ? scoreCardColor(score) : undefined} size="auto" rotate="left">
            {score}
          </Bullet>
          {/* Line-height must match PaperCard's ruled-line spacing (LINE_HEIGHT_PX), or the text drifts off its line over the length of the card. */}
          <p
            className={`flex-1 text-default text-neutral-900 ${bold ? "font-bold" : ""}`}
            style={{ lineHeight: `${LINE_HEIGHT_PX}px` }}
          >
            {text}
          </p>
        </div>
      </PaperCard>
    </div>
  );
}
