import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PENDING_STATUSES, REFUNDING_STATUSES, essayService } from "../../services/essayService";
import { CURRENT_USER_QUERY_KEY } from "../../contexts/AuthContext";
import type { EssayStatus } from "../../types/essay";

export function useEssayDetail(essayId: string | undefined) {
  const queryClient = useQueryClient();
  const essayQuery = useQuery({
    queryKey: ["essay", essayId],
    queryFn: () => essayService.getById(essayId!),
    enabled: Boolean(essayId),
    refetchInterval: (query) => (query.state.data && PENDING_STATUSES.includes(query.state.data.essay.status) ? 30000 : false),
  });

  // Same rejected/gave-up-retrying refund as `useEssays` (`REFUNDING_STATUSES`) — this hook backs the
  // essay result page, whose own 30s poll can observe the transition before the caller redirects
  // away for blocked statuses.
  const status = essayQuery.data?.essay.status;
  const previousStatus = useRef<EssayStatus | undefined>(status);
  useEffect(() => {
    if (status && previousStatus.current && PENDING_STATUSES.includes(previousStatus.current) && REFUNDING_STATUSES.includes(status)) {
      queryClient.invalidateQueries({ queryKey: CURRENT_USER_QUERY_KEY });
    }
    previousStatus.current = status;
  }, [status, queryClient]);

  return essayQuery;
}
