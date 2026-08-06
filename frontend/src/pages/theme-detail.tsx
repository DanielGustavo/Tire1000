import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { themeService } from "../services/theme-service";

export function ThemeDetailPage() {
  const { themeId } = useParams<{ themeId: string }>();

  const themeQuery = useQuery({
    queryKey: ["theme", themeId],
    queryFn: () => themeService.getById(themeId!),
    enabled: Boolean(themeId),
  });

  if (themeQuery.isPending) {
    return (
      <main className="min-h-screen p-4">
        <p className="text-sm text-gray-600">Carregando...</p>
      </main>
    );
  }

  if (themeQuery.isError) {
    return (
      <main className="min-h-screen p-4">
        <p className="text-sm text-red-600">Não foi possível carregar o tema.</p>
      </main>
    );
  }

  const { theme, referenceTexts, topic } = themeQuery.data;

  return (
    <main className="min-h-screen p-4">
      <Link to="/themes" className="text-sm text-gray-600 underline">
        ← Voltar para temas
      </Link>

      {topic && (
        <span
          className="mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white"
          style={{ backgroundColor: topic.color }}
        >
          {topic.title}
        </span>
      )}
      <h1 className="mt-2 text-2xl font-semibold text-gray-900">{theme.title}</h1>
      {theme.enemYear !== null && <p className="text-sm text-gray-600">ENEM {theme.enemYear}</p>}

      <div className="mt-6 space-y-6">
        {referenceTexts.map((referenceText) => (
          <section key={referenceText.id}>
            <h2 className="text-lg font-medium text-gray-900">{referenceText.title}</h2>
            <div className="mt-2 space-y-2">
              {referenceText.paragraphs.map((paragraph, index) =>
                paragraph.type === "TEXT" ? (
                  <p key={index} className="text-gray-800">
                    {paragraph.content}
                  </p>
                ) : (
                  <div key={index} className="rounded-md border border-dashed border-gray-300 p-4 text-sm text-gray-500">
                    Imagem: {paragraph.content.fileKey}
                  </div>
                ),
              )}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
