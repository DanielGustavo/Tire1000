import { ChevronLeft, ChevronRight } from "lucide-react";
import { IconButton } from "./IconButton";

/** Always keeps first/last/neighbors-of-current visible, collapsing gaps into "...". */
function buildPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);

  const keep = new Set([1, 2, total - 1, total, current - 1, current, current + 1]);
  const sorted = [...keep].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b);

  const result: (number | "...")[] = [];
  let previous = 0;
  for (const page of sorted) {
    if (previous && page - previous > 1) result.push("...");
    result.push(page);
    previous = page;
  }
  return result;
}

export function Pagination({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange: (page: number) => void }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex w-full items-center justify-center gap-6 pt-4">
      <IconButton
        variant="gray"
        aria-label="Página anterior"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        icon={<ChevronLeft size={24} className="text-neutral-0" />}
        className="disabled:opacity-50"
      />
      <div className="flex items-center gap-4">
        {buildPageNumbers(page, totalPages).map((entry, index) =>
          entry === "..." ? (
            <span key={`ellipsis-${index}`} className="text-small text-neutral-500">
              ...
            </span>
          ) : (
            <button
              key={entry}
              type="button"
              onClick={() => onPageChange(entry)}
              className={entry === page ? "text-default font-bold text-neutral-900 underline" : "text-small text-neutral-500"}
            >
              {entry}
            </button>
          ),
        )}
      </div>
      <IconButton
        variant="gray"
        aria-label="Próxima página"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        icon={<ChevronRight size={24} className="text-neutral-0" />}
        className="disabled:opacity-50"
      />
    </div>
  );
}
