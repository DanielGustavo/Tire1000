import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { themeService } from "../../../services/theme-service";
import { ThemeCard } from "./ThemeCard";

const RECENT_THEMES_COUNT = 5;

export function ThemesSection() {
  const themesQuery = useQuery({ queryKey: ["themes", "recent"], queryFn: () => themeService.list() });
  const recentThemes = themesQuery.data?.slice(0, RECENT_THEMES_COUNT) ?? [];

  return (
    <section className="flex w-full flex-col gap-4 px-4">
      <div className="flex w-full items-center justify-between">
        <h2 className="text-title font-extrabold text-neutral-900">Temas</h2>
        <Link to="/themes" className="flex items-center gap-0.5 text-small font-bold text-neutral-900">
          Ver todos
          <ChevronRight size={16} />
        </Link>
      </div>

      {themesQuery.isPending && <p className="text-default text-neutral-700">Carregando...</p>}
      {themesQuery.isError && <p className="text-default text-error-300">Não foi possível carregar os temas.</p>}

      {recentThemes.length > 0 && (
        <div className="flex w-full gap-4 overflow-x-auto pb-2">
          {recentThemes.map(({ theme, topic }) => (
            <ThemeCard key={theme.id} theme={theme} topic={topic} />
          ))}
        </div>
      )}
    </section>
  );
}
