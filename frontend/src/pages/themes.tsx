import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { themeService } from "../services/theme-service";
import { topicService } from "../services/topic-service";

export function ThemesPage() {
  const [topicId, setTopicId] = useState("");
  const [search, setSearch] = useState("");

  const topicsQuery = useQuery({ queryKey: ["topics"], queryFn: () => topicService.list() });
  const themesQuery = useQuery({
    queryKey: ["themes", { topicId, search }],
    queryFn: () => themeService.list({ topicId: topicId || undefined, search: search || undefined }),
  });

  return (
    <main className="min-h-screen p-4">
      <h1 className="text-2xl font-semibold text-gray-900">Temas</h1>

      <div className="mt-4 space-y-3">
        <input
          type="search"
          placeholder="Buscar por título"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
        />

        <select
          value={topicId}
          onChange={(event) => setTopicId(event.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
        >
          <option value="">Todos os eixos</option>
          {topicsQuery.data?.map((topic) => (
            <option key={topic.id} value={topic.id}>
              {topic.title}
            </option>
          ))}
        </select>
      </div>

      {themesQuery.isPending && <p className="mt-4 text-sm text-gray-600">Carregando...</p>}
      {themesQuery.isError && <p className="mt-4 text-sm text-red-600">Não foi possível carregar os temas.</p>}
      {themesQuery.data?.length === 0 && <p className="mt-4 text-sm text-gray-600">Nenhum tema encontrado.</p>}

      <ul className="mt-4 space-y-2">
        {themesQuery.data?.map(({ theme, topic }) => (
          <li key={theme.id}>
            <Link
              to={`/themes/${theme.id}`}
              className="block rounded-md border border-gray-200 p-3 hover:border-gray-400"
            >
              {topic && (
                <span
                  className="mr-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white"
                  style={{ backgroundColor: topic.color }}
                >
                  {topic.title}
                </span>
              )}
              {theme.title}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
