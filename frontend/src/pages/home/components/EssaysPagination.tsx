import { ChevronLeft, ChevronRight } from "lucide-react";
import { IconButton } from "../../../components/IconButton";

/** Anterior/Próxima only — unlike components/Pagination.tsx, there's no total page count to
 * number against: cursor pagination can't know how many pages exist ahead of time. */
export function EssaysPagination({
  hasPreviousPage,
  hasNextPage,
  onPrevious,
  onNext,
}: {
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  onPrevious: () => void;
  onNext: () => void;
}) {
  if (!hasPreviousPage && !hasNextPage) return null;

  return (
    <div className="flex w-full items-center justify-center gap-6 pt-4">
      <IconButton
        variant="gray"
        aria-label="Página anterior"
        disabled={!hasPreviousPage}
        onClick={onPrevious}
        icon={<ChevronLeft size={24} className="text-neutral-0" />}
        className="disabled:opacity-50"
      />
      <IconButton
        variant="gray"
        aria-label="Próxima página"
        disabled={!hasNextPage}
        onClick={onNext}
        icon={<ChevronRight size={24} className="text-neutral-0" />}
        className="disabled:opacity-50"
      />
    </div>
  );
}
