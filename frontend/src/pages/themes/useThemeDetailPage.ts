import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import type { EssayUploadMode } from "../../flows/essayCapture/hooks/useEssayCaptureFlow";
import { useAuth } from "../../contexts/AuthContext";
import { themeService } from "../../services/theme-service";

export function useThemeDetailPage() {
  const { themeId } = useParams<{ themeId: string }>();
  const navigate = useNavigate();
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState<EssayUploadMode | null>(null);

  const themeQuery = useQuery({
    queryKey: ["theme", themeId],
    queryFn: () => themeService.getById(themeId!),
    enabled: Boolean(themeId),
  });
  const { user, isLoading } = useAuth();

  function handleStartEssay(mode: EssayUploadMode) {
    if (!themeQuery.data || isLoading) return;
    if ((user?.credits ?? 0) > 0) {
      setUploadMode(mode);
    } else {
      setPriceModalOpen(true);
    }
  }

  return {
    themeQuery,
    ctaDisabled: isLoading,
    handleStartEssay,
    handleGoBack: () => navigate(-1),
    priceModalOpen,
    setPriceModalOpen,
    uploadThemeId: themeQuery.data?.theme.id,
    uploadMode,
    closeUploadFlow: () => setUploadMode(null),
    handleUploadDone: (essayId?: string) => navigate(essayId ? `/essays/${essayId}` : "/"),
  };
}
