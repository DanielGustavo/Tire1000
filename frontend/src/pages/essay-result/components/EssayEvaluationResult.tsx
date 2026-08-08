import { Bullet } from "../../../components/Bullet";
import { PaperCard } from "../../../components/PaperCard";
import { TexturedCard } from "../../../components/TexturedCard";
import { COMPETENCY_COLORS, COMPETENCY_IDS, type EssayEvaluation } from "../../../services/essay-service";
import { HighlightedEssayText } from "./HighlightedEssayText";

export function EssayEvaluationResult({ evaluation, textContent }: { evaluation: EssayEvaluation; textContent: string }) {
  return (
    <div className="flex w-full flex-col gap-6 px-4">
      <PaperCard>
        <HighlightedEssayText text={textContent} highlights={evaluation.highlights} />
      </PaperCard>

      {COMPETENCY_IDS.map((competencyId) => {
        const competency = evaluation.scores[competencyId];
        return (
          <div key={competencyId} className="flex w-full flex-col items-start gap-2">
            <Bullet size="auto" color={COMPETENCY_COLORS[competencyId]}>
              {competencyId}
            </Bullet>
            <TexturedCard color={COMPETENCY_COLORS[competencyId]} texture={false} className="w-full" contentClassName="items-end gap-4 p-2.5">
              <div className="flex w-full items-start gap-4">
                <Bullet variant="white" size="auto" rotate="left">
                  {competency.score}
                </Bullet>
                <p className="flex-1 text-default text-neutral-900">{competency.evaluationText}</p>
              </div>
            </TexturedCard>
          </div>
        );
      })}

      <div className="flex w-full flex-col items-start gap-2">
        <Bullet variant="dark-outline" size="auto">
          Nota final
        </Bullet>
        <PaperCard>
          <div className="flex w-full items-start gap-4">
            <Bullet size="auto" rotate="left">
              {evaluation.scores.final.score}
            </Bullet>
            <p className="flex-1 text-default text-neutral-900">{evaluation.scores.final.evaluationText}</p>
          </div>
        </PaperCard>
      </div>
    </div>
  );
}
