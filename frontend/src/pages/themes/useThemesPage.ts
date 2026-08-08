import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { themeService } from "../../services/theme-service";

const THEMES_PER_PAGE = 3;

export function useThemesPage() {
  const [search, setSearch] = useState("");
  const [topicId, setTopicId] = useState("");
  const [page, setPage] = useState(1);

  const themesQuery = useQuery({
    queryKey: ["themes", { topicId, search }],
    queryFn: () => themeService.list({ topicId: topicId || undefined, search: search || undefined }),
  });
  const themes = themesQuery.data ?? [];
  const totalPages = Math.max(1, Math.ceil(themes.length / THEMES_PER_PAGE));
  const pageThemes = themes.slice((page - 1) * THEMES_PER_PAGE, page * THEMES_PER_PAGE);

  useEffect(() => {
    setPage(1);
  }, [search, topicId]);

  return { search, setSearch, topicId, setTopicId, page, setPage, themesQuery, themes, pageThemes, totalPages };
}
