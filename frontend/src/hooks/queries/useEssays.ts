import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PENDING_STATUSES, essayCreditsMayHaveChanged, essayService } from "../../services/essayService";
import { CURRENT_USER_QUERY_KEY } from "../../contexts/AuthContext";
import type { EssayStatus } from "../../types/essay";

/**
 * Cursor-paginated — each page is its own cache entry (["essays", cursor]), so refetchInterval
 * only polls the page currently being viewed. Newest essays sort first, so a just-submitted essay
 * still pending review is normally on the first page anyway.
 */
export function useEssays(cursor?: string) {
  const queryClient = useQueryClient();
  const essaysQuery = useQuery({
    queryKey: ["essays", cursor ?? null],
    queryFn: () => essayService.list({ cursor }),
    refetchInterval: (query) =>
      query.state.data?.essays.some((essay) => PENDING_STATUSES.includes(essay.status)) ? 30000 : false,
  });

  // The poll above is how the app learns an essay's credit-affecting status changed — debited once
  // it leaves UPLOADING, refunded if it's later rejected/gives up retrying (`essayCreditsMayHaveChanged`).
  // Diff against the last seen status per essay so `/me` gets invalidated exactly on that transition.
  const essays = essaysQuery.data?.essays;
  const previousStatuses = useRef(new Map<string, EssayStatus>());
  useEffect(() => {
    let creditsMayHaveChanged = false;
    for (const essay of essays ?? []) {
      const previousStatus = previousStatuses.current.get(essay.id);
      if (previousStatus && essayCreditsMayHaveChanged(previousStatus, essay.status)) {
        creditsMayHaveChanged = true;
      }
      previousStatuses.current.set(essay.id, essay.status);
    }
    if (creditsMayHaveChanged) queryClient.invalidateQueries({ queryKey: CURRENT_USER_QUERY_KEY });
  }, [essays, queryClient]);

  return essaysQuery;
}
