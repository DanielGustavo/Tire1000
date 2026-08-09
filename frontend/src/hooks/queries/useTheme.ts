import { useQuery } from "@tanstack/react-query";
import { themeService } from "../../services/theme-service";

export function useTheme(themeId: string | undefined) {
  return useQuery({
    queryKey: ["theme", themeId],
    queryFn: () => themeService.getById(themeId!),
    enabled: Boolean(themeId),
  });
}
