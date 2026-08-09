import { useRef } from "react";
import { Loading } from "../../../components/Loading";
import { Pagination } from "../../../components/Pagination";
import { EssayCard } from "./EssayCard";
import { EssaysEmptyState } from "./EssaysEmptyState";
import { useEssaysSection } from "../hooks/useEssaysSection";

export function EssaysSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { page, setPage, essaysQuery, essays, pageEssays, totalPages } = useEssaysSection();

  // 5 essays can already fill a screen, so after switching pages (mobile and desktop) bring the
  // section's top back into view instead of leaving the user scrolled into the previous page's list.
  function handlePageChange(newPage: number) {
    setPage(newPage);
    sectionRef.current?.scrollIntoView({ block: "start" });
  }

  return (
    // scroll-mt-[72px] keeps the scrolled-to top edge clear of AppLayout's sticky header (72px tall
    // at every breakpoint: logo/IconButton are both 40px + p-4's 16px top/bottom padding), so
    // "Suas redações" lands visibly below it instead of tucked underneath.
    <section
      ref={sectionRef}
      className="flex w-full scroll-mt-[72px] flex-col gap-4 px-4 lg:flex-[0.8] lg:shrink-0 lg:px-10"
    >
      <h2 className="text-title font-extrabold text-neutral-900">Suas redações</h2>

      {essaysQuery.isPending && <Loading />}
      {essaysQuery.isError && <p className="text-default text-error-300">Não foi possível carregar suas redações.</p>}
      {essaysQuery.isSuccess && essays.length === 0 && (
        <div className="flex w-full flex-col lg:h-[606px] lg:items-center lg:justify-center">
          <EssaysEmptyState />
        </div>
      )}

      {pageEssays.length > 0 && (
        <div className="flex w-full flex-col gap-4">
          {pageEssays.map((essay) => (
            <EssayCard key={essay.id} essay={essay} />
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
    </section>
  );
}
