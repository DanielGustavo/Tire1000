import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Loading } from "../../components/Loading";
import { PaperCard } from "../../components/PaperCard";
import { ThemeBadges } from "../../components/ThemeBadges";
import { formatDate } from "../../libs/date";
import { CompetencyScores } from "./components/CompetencyScores";
import { CompetencyScoresSkeleton } from "./components/CompetencyScoresSkeleton";
import { HighlightedEssayText } from "./components/HighlightedEssayText";
import { PendingResult } from "./components/PendingResult";
import { useEssayResultPage } from "./useEssayResultPage";

export function EssayResultPage() {
  const { essayQuery, blocked } = useEssayResultPage();

  if (essayQuery.isPending || blocked) {
    return <Loading text="Carregando..." />;
  }

  if (essayQuery.isError) {
    return (
      <div className="flex w-full flex-col gap-4 px-4">
        <p className="text-default text-error-300">Não foi possível carregar o resultado da sua redação.</p>
      </div>
    );
  }

  const { essay } = essayQuery.data;
  const evaluationResult =
    essay.status === "SUCCESS" && essay.evaluation && essay.textContent ? { evaluation: essay.evaluation, textContent: essay.textContent } : null;

  return (
    // lg: splits into the Figma desktop frame's 2 columns — Article Section (back button/title/essay
    // text) flex-1 on the left, a fixed score sidebar on the right — instead of the mobile single column
    // where the sidebar's content stacks below. Teto/padding scoped to this page only, same pattern as
    // tickets 08/09/10/11.
    <div className="flex w-full flex-col gap-6 lg:mx-auto lg:max-w-[1280px] lg:flex-row lg:items-start lg:px-10">
      <div className="flex flex-1 flex-col items-start gap-6 px-4 lg:px-0  lg:sticky lg:top-[88px]">
        <div className="flex flex-col items-start gap-4">
          <Link to="/" className="flex items-center gap-0.5 text-small font-bold text-neutral-900">
            <ChevronRight size={16} className="rotate-180" />
            Voltar
          </Link>

          <div className="flex flex-col items-start gap-1">
            {/* topicTitle is the presence gate: null only for essays created before this
                denormalization shipped (no retroactive migration) — hides both badges rather
                than showing a half-populated pair. enemYear can be legitimately null on its
                own (theme with no ENEM year); ThemeBadges already falls back to "Tire 1000". */}
            {essay.topicTitle && (
              <ThemeBadges
                theme={{ enemYear: essay.enemYear }}
                topic={{ title: essay.topicTitle, color: essay.topicColor }}
              />
            )}
            <h1 className="text-subtitle font-bold capitalize text-neutral-900">{essay.themeTitle}</h1>
            <p className="text-small text-neutral-900">{formatDate(essay.createdAt)}</p>
          </div>
        </div>

        {evaluationResult ? (
          <PaperCard>
            <HighlightedEssayText text={evaluationResult.textContent} highlights={evaluationResult.evaluation.highlights} />
          </PaperCard>
        ) : (
          <PendingResult status={essay.status} />
        )}
      </div>

      {evaluationResult ? (
        // Sticks below AppLayout's fixed 72px header (see AppLayout.tsx) so the score sidebar stays
        // visible while the essay text column beside it scrolls, releasing naturally once this column
        // ends — same sticky-column pattern as themeDetail.tsx's CTA card. Content here (5 competency
        // cards + final score) is short/fixed-size, so no internal scroll is needed.
        <div className="flex w-full flex-col gap-6 px-4 lg:w-[403px] lg:shrink-0 lg:px-0">
          <CompetencyScores evaluation={evaluationResult.evaluation} />
        </div>
      ) : (
        // Skeleton sidebar is desktop-only (Figma "in progress"/"loading" frames) — mobile keeps ticket
        // 07's single-column pending state (just PendingResult's sticky note, no sidebar at all).
        // Same sticky treatment as the success-state sidebar above.
        <div className="hidden lg:flex lg:w-[403px] lg:shrink-0 lg:flex-col lg:gap-6 lg:opacity-45 lg:px-0">
          <CompetencyScoresSkeleton status={essay.status} />
        </div>
      )}
    </div>
  );
}
