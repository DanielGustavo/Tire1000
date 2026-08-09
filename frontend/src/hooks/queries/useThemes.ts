import { useQuery } from "@tanstack/react-query";
import { themeService } from "../../services/theme-service";

export function useThemes({ topicId, search }: { topicId?: string; search?: string }) {
  return useQuery({
    queryKey: ["themes", { topicId, search }],
    queryFn: () => themeService.list({ topicId: topicId || undefined, search: search || undefined }),
  });
}
