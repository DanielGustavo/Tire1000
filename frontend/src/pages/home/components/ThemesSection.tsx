import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { themeService } from "../../../services/themeService";
import { Loading } from "../../../components/Loading";
import { ThemeCard } from "./ThemeCard";

const RECENT_THEMES_COUNT = 5;

export function ThemesSection() {
  const themesQuery = useQuery({ queryKey: ["themes", "recent"], queryFn: () => themeService.list() });
  const recentThemes = themesQuery.data?.slice(0, RECENT_THEMES_COUNT) ?? [];
  const [emblaRef] = useEmblaCarousel({ align: "start", loop: false, containScroll: "trimSnaps" });
  const themeCards = recentThemes.map(({ theme, topic }) => <ThemeCard key={theme.id} theme={theme} topic={topic} />);

  return (
    // lg: sticks below the fixed AppLayout header (72px, see AppLayout.tsx) and claims the full
    // remaining viewport height so the section itself never scrolls with the page — only the theme
    // list below the "Temas"/"Ver todos" row scrolls internally (overflow-y-auto further down).
    // min-w-[320px] reuses ThemeCard's mobile carousel snap-width so the column never gets
    // squeezed too narrow on smaller desktop viewports.
    <section className="flex w-full flex-col gap-4 px-4 lg:sticky lg:top-[88px] lg:h-[calc(100vh-88px)] lg:flex-[0.4] lg:px-10">
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
        <>
          {/* Mobile: horizontal embla carousel (cards are wider than the viewport). Desktop: a plain
              vertical list fits the whole column, so it swaps to a static stack instead of reusing
              the carousel — embla's slide math assumes a horizontal row and would fight a flex-col. */}
          <div className="w-full overflow-hidden lg:hidden" ref={emblaRef}>
            <div className="flex w-full gap-4 pb-2">{themeCards}</div>
          </div>
          {/* lg:min-h-0 lets this flex child shrink below its content height so overflow-y-auto can
              actually kick in inside the section's fixed height, instead of stretching past it. */}
          <div className="hidden w-full flex-col gap-2.5 lg:flex lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:px-1">
            {themeCards}
            <Link to="/themes" className="w-full py-2 text-center text-small font-bold text-neutral-900">
              Ver todos temas
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
