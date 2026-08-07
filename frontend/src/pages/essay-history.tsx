import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { essayService, type EssayStatus } from "../services/essay-service";

const STATUS_LABELS: Record<EssayStatus, string> = {
  UPLOADING: "Enviando",
  QUEUED: "Na fila da Revisão",
  UPLOAD_FAILED: "Falha no envio",
  VALIDATING: "Em Revisão",
  VALIDATION_FAILED: "Falha na Revisão",
  REJECTED: "Rejeitada na Revisão",
  VALIDATED: "Na fila da Avaliação",
  EVALUATING: "Em Avaliação",
  EVALUATION_FAILED: "Falha na Avaliação",
  SUCCESS: "Avaliada",
};

export function EssayHistoryPage() {
  const essaysQuery = useQuery({ queryKey: ["essays"], queryFn: () => essayService.list() });

  return (
    <main className="min-h-screen p-4">
      <h1 className="text-2xl font-semibold text-gray-900">Minhas redações</h1>

      {essaysQuery.isPending && <p className="mt-4 text-sm text-gray-600">Carregando...</p>}
      {essaysQuery.isError && <p className="mt-4 text-sm text-red-600">Não foi possível carregar suas redações.</p>}
      {essaysQuery.data?.essays.length === 0 && (
        <p className="mt-4 text-sm text-gray-600">Você ainda não enviou nenhuma redação.</p>
      )}

      <ul className="mt-4 space-y-2">
        {essaysQuery.data?.essays.map((essay) => (
          <li key={essay.id}>
            <Link to={`/essays/${essay.id}`} className="block rounded-md border border-gray-200 p-3 hover:border-gray-400">
              <span
                className="mr-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white"
                style={{ backgroundColor: essay.topicColor }}
              >
                {STATUS_LABELS[essay.status]}
              </span>
              {essay.themeTitle}
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-sm">
        <Link to="/" className="font-medium text-gray-900 underline">
          Voltar
        </Link>
      </p>
    </main>
  );
}
