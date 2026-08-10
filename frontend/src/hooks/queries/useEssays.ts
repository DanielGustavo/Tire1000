import { useQuery } from "@tanstack/react-query";
import { PENDING_STATUSES, essayService } from "../../services/essayService";

/**
 * Cursor-paginated — each page is its own cache entry (`["essays", cursor]`), so `refetchInterval`
 * only polls the page currently being viewed. Newest essays sort first, so a just-submitted essay
 * still pending review is normally on the first page anyway.
 */
export function useEssays(cursor?: string) {
  return useQuery({
    queryKey: ["essays", cursor ?? null],
    queryFn: () => essayService.list({ cursor }),
    refetchInterval: (query) =>
      query.state.data?.essays.some((essay) => PENDING_STATUSES.includes(essay.status)) ? 30000 : false,
  });
}
