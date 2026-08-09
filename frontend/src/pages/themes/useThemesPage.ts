import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { themeService } from "../../services/theme-service";

const THEMES_PER_PAGE = 3;

export function useThemesPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get("search") ?? "";
  const topicId = searchParams.get("topicId") ?? "";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  function setSearch(value: string) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set("search", value);
      else next.delete("search");
      next.delete("page");
      return next;
    });
  }

  function setTopicId(value: string) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set("topicId", value);
      else next.delete("topicId");
      next.delete("page");
      return next;
    });
  }

  function setPage(value: number) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value > 1) next.set("page", String(value));
      else next.delete("page");
      return next;
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const themesQuery = useQuery({
    queryKey: ["themes", { topicId, search }],
    queryFn: () => themeService.list({ topicId: topicId || undefined, search: search || undefined }),
  });
  const themes = themesQuery.data ?? [];
  const totalPages = Math.max(1, Math.ceil(themes.length / THEMES_PER_PAGE));
  const pageThemes = themes.slice((page - 1) * THEMES_PER_PAGE, page * THEMES_PER_PAGE);

  return { search, setSearch, topicId, setTopicId, page, setPage, themesQuery, themes, pageThemes, totalPages };
}
