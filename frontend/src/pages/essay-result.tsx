import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getApiErrorMessage } from "../libs/axios";
import { essayService, type EssayStatus } from "../services/essay-service";

const MAX_PHOTO_SIZE_IN_BYTES = 10 * 1024 * 1024;

const REJECTION_REASON_LABELS: Record<string, string> = {
  ILLEGIBLE_HANDWRITING: "Letra ilegível",
  LOW_LIGHTING: "Iluminação baixa",
  TOO_FEW_LINES: "Menos de 7 linhas",
  TOO_MANY_LINES: "Mais de 30 linhas",
};

// Still going through the fila de Revisão — keep polling.
const PENDING_STATUSES: EssayStatus[] = ["UPLOADING", "QUEUED", "VALIDATING"];
const RESENDABLE_STATUSES: EssayStatus[] = ["UPLOADING", "REJECTED", "UPLOAD_FAILED", "VALIDATION_FAILED"];

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

      {PENDING_STATUSES.includes(essay.status) && (
        <p className="mt-2 text-sm text-gray-600">
          Sua redação está sendo revisada — checando letra, iluminação e contagem de linhas. Essa página atualiza sozinha.
        </p>
      )}

      {essay.status === "VALIDATED" && (
        <p className="mt-2 text-sm text-green-700">
          Aprovada na Revisão! Sua redação entrou na fila de Avaliação — o resultado completo aparece no seu histórico assim que
          terminar.
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

      <p className="mt-6 text-sm">
        <Link to="/themes" className="font-medium text-gray-900 underline">
          Voltar para temas
        </Link>
      </p>
    </main>
  );
}
