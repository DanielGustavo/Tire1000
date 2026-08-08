import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { themeService } from "../../services/theme-service";
import { userService } from "../../services/user-service";

export function useThemeDetailPage() {
  const { themeId } = useParams<{ themeId: string }>();
  const navigate = useNavigate();
  const [priceModalOpen, setPriceModalOpen] = useState(false);

  const themeQuery = useQuery({
    queryKey: ["theme", themeId],
    queryFn: () => themeService.getById(themeId!),
    enabled: Boolean(themeId),
  });
  const userQuery = useQuery({ queryKey: ["currentUser"], queryFn: () => userService.getCurrentUser() });

  function handleStartEssay() {
    if (!themeQuery.data || userQuery.isPending) return;
    if ((userQuery.data?.credits ?? 0) > 0) {
      navigate(`/essays/new?themeId=${themeQuery.data.theme.id}`);
    } else {
      setPriceModalOpen(true);
    }
  }

  return {
    themeQuery,
    ctaDisabled: userQuery.isPending,
    handleStartEssay,
    priceModalOpen,
    setPriceModalOpen,
  };
}
