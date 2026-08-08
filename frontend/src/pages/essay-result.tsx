import { useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getApiErrorMessage } from "../libs/axios";
import {
  essayService,
  REJECTION_REASON_LABELS,
  RESENDABLE_STATUSES,
  type CompetencyId,
  type EssayEvaluation,
  type EssayHighlight,
  type EssayStatus,
} from "../services/essay-service";

const MAX_PHOTO_SIZE_IN_BYTES = 10 * 1024 * 1024;

const COMPETENCY_IDS: CompetencyId[] = ["C1", "C2", "C3", "C4", "C5"];

const COMPETENCY_LABELS: Record<CompetencyId, string> = {
  C1: "Competência I — Domínio da norma culta",
  C2: "Competência II — Compreensão do tema",
  C3: "Competência III — Argumentação",
  C4: "Competência IV — Coesão textual",
  C5: "Competência V — Proposta de intervenção",
};

const COMPETENCY_COLORS: Record<CompetencyId, string> = {
  C1: "#FDE68A",
  C2: "#BFDBFE",
  C3: "#BBF7D0",
  C4: "#FBCFE8",
  C5: "#DDD6FE",
};

// Still going through the fila de Revisão — keep polling.
const VALIDATING_STATUSES: EssayStatus[] = ["UPLOADING", "QUEUED", "VALIDATING"];
// Revisão passed, still going through the fila de Avaliação — keep polling.
const EVALUATING_STATUSES: EssayStatus[] = ["VALIDATED", "EVALUATING"];
const PENDING_STATUSES: EssayStatus[] = [...VALIDATING_STATUSES, ...EVALUATING_STATUSES];

interface HighlightedTextSegment {
  text: string;
  highlight: EssayHighlight | null;
}

/** Splits `text` around non-overlapping highlight ranges, sorted by position — later overlapping ranges are dropped. */
function buildHighlightedTextSegments(text: string, highlights: EssayHighlight[]): HighlightedTextSegment[] {
  const sorted = [...highlights].sort((a, b) => a.anchorIndex - b.anchorIndex);
  const segments: HighlightedTextSegment[] = [];
  let cursor = 0;

  for (const highlight of sorted) {
    if (highlight.anchorIndex < cursor) continue;
    if (highlight.anchorIndex > cursor) segments.push({ text: text.slice(cursor, highlight.anchorIndex), highlight: null });
    segments.push({ text: text.slice(highlight.anchorIndex, highlight.endIndex), highlight });
    cursor = highlight.endIndex;
  }

  if (cursor < text.length) segments.push({ text: text.slice(cursor), highlight: null });
  return segments;
}

function HighlightedText({ text, highlights }: { text: string; highlights: EssayHighlight[] }): ReactNode {
  return buildHighlightedTextSegments(text, highlights).map((segment, index) =>
    segment.highlight ? (
      <span key={index} className="group relative inline">
        <mark style={{ backgroundColor: COMPETENCY_COLORS[segment.highlight.type] }}>{segment.text}</mark>
        <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 w-max max-w-xs -translate-x-1/2 rounded-md bg-gray-900 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
          {segment.highlight.textContent}
        </span>
      </span>
    ) : (
      <span key={index}>{segment.text}</span>
    ),
  );
}

function EssayEvaluationSummary({ evaluation, textContent }: { evaluation: EssayEvaluation; textContent: string | null }) {
  return (
    <div className="mt-4 space-y-6">
      <div className="rounded-md border border-gray-200 p-4">
        <p className="text-3xl font-semibold text-gray-900">
          {evaluation.scores.final.score}
          <span className="text-base font-normal text-gray-500"> / 1000</span>
        </p>
        <p className="mt-2 whitespace-pre-line text-sm text-gray-700">{evaluation.scores.final.evaluationText}</p>
      </div>

      {textContent && (
        <div className="rounded-md border border-gray-200 p-4">
          <h2 className="text-sm font-medium text-gray-900">Sua redação</h2>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-800">
            <HighlightedText text={textContent} highlights={evaluation.highlights} />
          </p>
        </div>
      )}

      <div className="space-y-3">
        {COMPETENCY_IDS.map((competencyId) => {
          const competency = evaluation.scores[competencyId];
          return (
            <div key={competencyId} className="rounded-md border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">
                  <span
                    className="mr-2 inline-block h-2.5 w-2.5 rounded-full align-middle"
                    style={{ backgroundColor: COMPETENCY_COLORS[competencyId] }}
                  />
                  {COMPETENCY_LABELS[competencyId]}
                </h3>
                <span className="text-sm font-semibold text-gray-900">{competency.score} / 200</span>
              </div>
              <p className="mt-2 text-sm text-gray-700">{competency.evaluationText}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function EssayResultPage() {
  const { essayId } = useParams<{ essayId: string }>();
  const queryClient = useQueryClient();
  const [photo, setPhoto] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const essayQuery = useQuery({
    queryKey: ["essay", essayId],
    queryFn: () => essayService.getById(essayId!),
    enabled: Boolean(essayId),
    refetchInterval: (query) => (query.state.data && PENDING_STATUSES.includes(query.state.data.essay.status) ? 2000 : false),
  });

  const resendMutation = useMutation({
    mutationFn: async (photo: File) => {
      const { upload } = await essayService.resend(essayId!);
      await essayService.uploadPhoto(upload, photo);
    },
    onSuccess: () => {
      setPhoto(null);
      queryClient.invalidateQueries({ queryKey: ["essay", essayId] });
    },
  });

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    if (file && file.size > MAX_PHOTO_SIZE_IN_BYTES) {
      setPhoto(null);
      setFileError("A foto deve ter no máximo 10MB.");
      return;
    }
    setFileError(null);
    setPhoto(file);
  }

  function handleResendSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!photo) return;
    resendMutation.mutate(photo);
  }

  if (essayQuery.isPending) {
    return (
      <main className="min-h-screen p-4">
        <p className="text-sm text-gray-600">Carregando...</p>
      </main>
    );
  }

  if (essayQuery.isError) {
    return (
      <main className="min-h-screen p-4">
        <p className="text-sm text-red-600">Não foi possível carregar o resultado da sua redação.</p>
      </main>
    );
  }

  const { essay } = essayQuery.data;
  const isResendable = RESENDABLE_STATUSES.includes(essay.status);

  return (
    <main className="min-h-screen p-4">
      <h1 className="text-2xl font-semibold text-gray-900">{essay.themeTitle}</h1>

      {VALIDATING_STATUSES.includes(essay.status) && (
        <p className="mt-2 text-sm text-gray-600">
          Sua redação está sendo revisada — checando letra, iluminação e contagem de linhas. Essa página atualiza sozinha.
        </p>
      )}

      {EVALUATING_STATUSES.includes(essay.status) && (
        <p className="mt-2 text-sm text-gray-600">
          Aprovada na Revisão! Sua redação está sendo avaliada nas 5 competências do Enem. Essa página atualiza sozinha.
        </p>
      )}

      {essay.status === "REJECTED" && (
        <div className="mt-2">
          <p className="text-sm text-red-600">Sua redação foi rejeitada na Revisão:</p>
          <ul className="mt-1 list-inside list-disc text-sm text-red-600">
            {essay.rejectionReasons.map((reason) => (
              <li key={reason}>{REJECTION_REASON_LABELS[reason] ?? reason}</li>
            ))}
          </ul>
        </div>
      )}

      {essay.status === "EVALUATION_FAILED" && (
        <p className="mt-2 text-sm text-red-600">
          Tivemos uma falha técnica ao avaliar sua redação. Seu crédito não é devolvido nesse caso — nosso time vai reprocessar a
          mesma redação assim que o problema for corrigido.
        </p>
      )}

      {essay.status === "SUCCESS" && essay.evaluation && (
        <EssayEvaluationSummary evaluation={essay.evaluation} textContent={essay.textContent} />
      )}

      {essay.status === "VALIDATION_FAILED" && (
        <p className="mt-2 text-sm text-red-600">
          Tivemos uma falha técnica ao processar sua redação. Seu crédito foi devolvido — tente reenviar.
        </p>
      )}

      {essay.status === "UPLOAD_FAILED" && (
        <p className="mt-2 text-sm text-red-600">Não foi possível confirmar o envio da foto. Tente reenviar.</p>
      )}

      {isResendable && (
        <form onSubmit={handleResendSubmit} className="mt-6 max-w-sm space-y-4">
          <div>
            <label htmlFor="photo" className="block text-sm font-medium text-gray-700">
              Reenviar foto da redação
            </label>
            <input
              id="photo"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoChange}
              className="mt-1 w-full text-sm text-gray-700"
            />
            <p className="mt-1 text-xs text-gray-500">Tamanho máximo: 10MB.</p>
          </div>

          {fileError && <p className="text-sm text-red-600">{fileError}</p>}
          {resendMutation.isError && (
            <p className="text-sm text-red-600">
              {getApiErrorMessage(resendMutation.error, "Não foi possível reenviar sua redação. Tente novamente.")}
            </p>
          )}
          {resendMutation.isSuccess && <p className="text-sm text-green-700">Redação reenviada!</p>}

          <button
            type="submit"
            disabled={resendMutation.isPending || !photo}
            className="w-full rounded-md bg-gray-900 px-4 py-2 text-white disabled:opacity-50"
          >
            {resendMutation.isPending ? "Reenviando..." : "Reenviar redação"}
          </button>
        </form>
      )}

      <p className="mt-6 space-x-4 text-sm">
        <Link to="/" className="font-medium text-gray-900 underline">
          Minhas redações
        </Link>
        <Link to="/themes" className="font-medium text-gray-900 underline">
          Voltar para temas
        </Link>
      </p>
    </main>
  );
}
