import { useQuery } from "@tanstack/react-query";
import { PENDING_STATUSES, essayService } from "../../services/essayService";

export function useEssayDetail(essayId: string | undefined) {
  return useQuery({
    queryKey: ["essay", essayId],
    queryFn: () => essayService.getById(essayId!),
    enabled: Boolean(essayId),
    refetchInterval: (query) => (query.state.data && PENDING_STATUSES.includes(query.state.data.essay.status) ? 30000 : false),
  });
}
