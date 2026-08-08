import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDate } from "../../libs/date";
import { EssayEvaluationResult } from "./components/EssayEvaluationResult";
import { PendingResult } from "./components/PendingResult";
import { useEssayResultPage } from "./useEssayResultPage";

export function EssayResultPage() {
  const { essayQuery, blocked } = useEssayResultPage();

  if (essayQuery.isPending || blocked) {
    return (
      <div className="flex w-full flex-col gap-4 px-4">
        <p className="text-default text-neutral-700">Carregando...</p>
      </div>
    );
  }

  if (essayQuery.isError) {
    return (
      <div className="flex w-full flex-col gap-4 px-4">
        <p className="text-default text-error-300">Não foi possível carregar o resultado da sua redação.</p>
      </div>
    );
  }

  const { essay } = essayQuery.data;

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col items-start gap-4 px-4">
        <Link to="/" className="flex items-center gap-0.5 text-small font-bold text-neutral-900">
          <ChevronRight size={16} className="rotate-180" />
          Voltar
        </Link>

        <div className="flex flex-col items-start gap-1">
          <h1 className="text-subtitle font-bold capitalize text-neutral-900">{essay.themeTitle}</h1>
          <p className="text-small text-neutral-900">{formatDate(essay.createdAt)}</p>
        </div>
      </div>

      {essay.status === "SUCCESS" && essay.evaluation && essay.textContent ? (
        <EssayEvaluationResult evaluation={essay.evaluation} textContent={essay.textContent} />
      ) : (
        <div className="px-4">
          <PendingResult status={essay.status} />
        </div>
      )}
    </div>
  );
}
