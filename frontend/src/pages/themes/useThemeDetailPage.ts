import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import type { EssayUploadMode } from "../essay-upload/useEssayUploadPage";
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

  function handleStartEssay(mode: EssayUploadMode) {
    if (!themeQuery.data || userQuery.isPending) return;
    if ((userQuery.data?.credits ?? 0) > 0) {
      navigate(`/essays/new?themeId=${themeQuery.data.theme.id}&mode=${mode}`);
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
