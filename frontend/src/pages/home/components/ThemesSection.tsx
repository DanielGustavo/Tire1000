import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { themeService } from "../../../services/theme-service";
import { Loading } from "../../../components/Loading";
import { ThemeCard } from "./ThemeCard";

const RECENT_THEMES_COUNT = 5;

export function ThemesSection() {
  const themesQuery = useQuery({ queryKey: ["themes", "recent"], queryFn: () => themeService.list() });
  const recentThemes = themesQuery.data?.slice(0, RECENT_THEMES_COUNT) ?? [];
  const [emblaRef] = useEmblaCarousel({ align: "start", loop: false, containScroll: "trimSnaps" });

  return (
    <section className="flex w-full flex-col gap-4 px-4">
      <div className="flex w-full items-center justify-between">
        <h2 className="text-title font-extrabold text-neutral-900">Temas</h2>
        <Link to="/themes" className="flex items-center gap-0.5 text-small font-bold text-neutral-900">
          Ver todos
          <ChevronRight size={16} />
        </Link>
      </div>

      {themesQuery.isPending && <Loading />}
      {themesQuery.isError && <p className="text-default text-error-300">Não foi possível carregar os temas.</p>}

      {recentThemes.length > 0 && (
        <div className="w-full overflow-hidden" ref={emblaRef}>
          <div className="flex w-full gap-4 pb-2">
            {recentThemes.map(({ theme, topic }) => (
              <ThemeCard key={theme.id} theme={theme} topic={topic} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
