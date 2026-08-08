import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { essayService } from "../../../services/essay-service";

const ESSAYS_PER_PAGE = 5;

export function useEssaysSection() {
  const [page, setPage] = useState(1);
  const essaysQuery = useQuery({ queryKey: ["essays"], queryFn: () => essayService.list() });
  const essays = essaysQuery.data?.essays ?? [];
  const totalPages = Math.max(1, Math.ceil(essays.length / ESSAYS_PER_PAGE));
  const pageEssays = essays.slice((page - 1) * ESSAYS_PER_PAGE, page * ESSAYS_PER_PAGE);

  return { page, setPage, essaysQuery, essays, pageEssays, totalPages };
}
