import { Pagination } from "../../../components/Pagination";
import { EssayCard } from "./EssayCard";
import { EssaysEmptyState } from "./EssaysEmptyState";
import { useEssaysSection } from "./useEssaysSection";

export function EssaysSection() {
  const { page, setPage, essaysQuery, essays, pageEssays, totalPages } = useEssaysSection();

  return (
    <section className="flex w-full flex-col gap-4 px-4">
      <h2 className="text-title font-extrabold text-neutral-900">Suas redações</h2>

      {essaysQuery.isPending && <p className="text-default text-neutral-700">Carregando...</p>}
      {essaysQuery.isError && <p className="text-default text-error-300">Não foi possível carregar suas redações.</p>}
      {essaysQuery.isSuccess && essays.length === 0 && <EssaysEmptyState />}

      {pageEssays.length > 0 && (
        <div className="flex w-full flex-col gap-4">
          {pageEssays.map((essay) => (
            <EssayCard key={essay.id} essay={essay} />
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </section>
  );
}
