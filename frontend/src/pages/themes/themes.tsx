import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, SlidersHorizontal } from "lucide-react";
import { Field } from "../../components/Field";
import { IconButton } from "../../components/IconButton";
import { Loading } from "../../components/Loading";
import { Pagination } from "../../components/Pagination";
import { ThemeListItem } from "./components/ThemeListItem";
import { ThemesFilterModal } from "./components/ThemesFilterModal";
import { useThemesPage } from "./useThemesPage";

export function ThemesPage() {
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const { search, setSearch, topicId, setTopicId, page, setPage, themesQuery, themes, pageThemes, totalPages } =
    useThemesPage();

  return (
    // Capped here (not in the shared AppLayout — see home.tsx/map.md ticket 09) so only this
    // page's own content stops stretching on ultra-wide screens.
    <div className="flex w-full flex-col gap-6 lg:mx-auto lg:max-w-[1280px]">
      <div className="flex flex-col items-start px-4 lg:px-10">
        <Link to="/" className="flex items-center gap-0.5 text-small font-bold text-neutral-900">
          <ChevronRight size={16} className="rotate-180" />
          Voltar
        </Link>
        <h1 className="text-title font-extrabold text-neutral-900">Temas</h1>
      </div>

      <div className="flex items-center gap-2 px-4 lg:px-10">
        <Field
          type="search"
          placeholder="Buscar tema"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <IconButton
          variant="gray"
          size="large"
          aria-label="Filtrar temas"
          onClick={() => setFilterModalOpen(true)}
          icon={<SlidersHorizontal size={24} className="text-neutral-0" />}
        />
      </div>

      <div className="flex w-full flex-col gap-4 px-4 lg:px-10">
        {themesQuery.isPending && <Loading />}
        {themesQuery.isError && <p className="text-default text-error-300">Não foi possível carregar os temas.</p>}
        {themesQuery.isSuccess && themes.length === 0 && (
          <p className="text-default text-neutral-700">Nenhum tema encontrado.</p>
        )}

        {/* lg: swaps the single stacked column for the 3-column grid in the Figma desktop frame
            (which shows a 3x3 grid, i.e. 9 themes/page). THEMES_PER_PAGE intentionally stays 3
            here — matching per-page count to columns (9) would mean the "page" a URL points to
            depends on viewport width (resizing across lg: would need to recompute page/totalPages,
            and a shared link could land on a different set of themes on mobile vs desktop). That's
            a real behavior change, not just layout, so it's left as an open question (see ticket
            10's Answer) instead of guessed at without a live user — this grid only ever renders
            one row of 3 for now. */}
        <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-3">
          {pageThemes.map(({ theme, topic }) => (
            <ThemeListItem key={theme.id} theme={theme} topic={topic} />
          ))}
        </div>

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {filterModalOpen && (
        <ThemesFilterModal
          topicId={topicId}
          onApply={(newTopicId) => {
            setTopicId(newTopicId);
            setFilterModalOpen(false);
          }}
          onClose={() => setFilterModalOpen(false)}
        />
      )}
    </div>
  );
}
