import { useQuery } from "@tanstack/react-query";
import { PENDING_STATUSES, essayService } from "../../services/essay-service";

export function useEssays() {
  return useQuery({
    queryKey: ["essays"],
    queryFn: () => essayService.list(),
    refetchInterval: (query) =>
      query.state.data?.essays.some((essay) => PENDING_STATUSES.includes(essay.status)) ? 30000 : false,
  });
}
