import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useThemes } from "../../hooks/queries/useThemes";
import { useIsDesktop } from "../../hooks/app/useIsDesktop";

const THEMES_PER_PAGE_MOBILE = 3;
const THEMES_PER_PAGE_DESKTOP = 9;

/** Clones `params` and drops `page` — any filter change invalidates the current page. */
function withoutPage(params: URLSearchParams): URLSearchParams {
  const next = new URLSearchParams(params);
  next.delete("page");
  return next;
}

export function useThemesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isDesktop = useIsDesktop();
  const themesPerPage = isDesktop ? THEMES_PER_PAGE_DESKTOP : THEMES_PER_PAGE_MOBILE;

  const search = searchParams.get("search") ?? "";
  const topicId = searchParams.get("topicId") ?? "";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  function setSearch(value: string) {
    setSearchParams((prev) => {
      const next = withoutPage(prev);
      if (value) next.set("search", value);
      else next.delete("search");
      return next;
    });
  }

  // replace: true because this runs while ThemesFilterModal (which pushes its own history
  // entry to close on back-button) is still open — pushing here too would leave the modal's
  // history.back() cleanup popping the filter instead of the modal marker.
  function setTopicId(value: string) {
    setSearchParams(
      (prev) => {
        const next = withoutPage(prev);
        if (value) next.set("topicId", value);
        else next.delete("topicId");
        return next;
      },
      { replace: true },
    );
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

  // Resets to page 1 whenever the effective per-page count changes — i.e. whenever a live
  // resize crosses the desktop/mobile breakpoint. Skips the initial mount so a page number
  // the user arrived with (shared/bookmarked URL) isn't clobbered on first render.
  //
  // setSearchParams is read through a ref instead of listed as a dependency: react-router
  // memoizes it on `[navigate, searchParams]`, and `searchParams` gets a new identity on every
  // URL change — including a plain page click. Depending on it directly reran this effect right
  // after setPage() and immediately stripped `page` back off, so pagination looked broken.
  const setSearchParamsRef = useRef(setSearchParams);
  setSearchParamsRef.current = setSearchParams;

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setSearchParamsRef.current(withoutPage);
  }, [themesPerPage]);

  const themesQuery = useThemes({ topicId, search });
  const themes = themesQuery.data ?? [];
  const totalPages = Math.max(1, Math.ceil(themes.length / themesPerPage));
  const pageThemes = themes.slice((page - 1) * themesPerPage, page * themesPerPage);

  return { search, setSearch, topicId, setTopicId, page, setPage, themesQuery, themes, pageThemes, totalPages };
}
