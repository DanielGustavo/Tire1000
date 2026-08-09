import { useState } from "react";
import { useEssays } from "../../../hooks/queries/useEssays";

const ESSAYS_PER_PAGE = 5;

export function useEssaysSection() {
  const [page, setPage] = useState(1);
  const essaysQuery = useEssays();
  const essays = essaysQuery.data?.essays ?? [];
  const totalPages = Math.max(1, Math.ceil(essays.length / ESSAYS_PER_PAGE));
  const pageEssays = essays.slice(
    (page - 1) * ESSAYS_PER_PAGE,
    page * ESSAYS_PER_PAGE,
  );

  return { page, setPage, essaysQuery, essays, pageEssays, totalPages };
}
