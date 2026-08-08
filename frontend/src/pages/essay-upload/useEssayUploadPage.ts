import { useNavigate, useSearchParams } from "react-router-dom";
import { essayService } from "../../services/essay-service";
import { useEssayCaptureFlow, type EssayUploadMode } from "./useEssayCaptureFlow";

export type { EssayUploadMode } from "./useEssayCaptureFlow";

export function useEssayUploadPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const themeId = searchParams.get("themeId") ?? "";
  const mode: EssayUploadMode = searchParams.get("mode") === "camera" ? "camera" : "upload";

  const flow = useEssayCaptureFlow({
    mode,
    onSubmit: async (photo) => {
      const { upload } = await essayService.upload(themeId);
      await essayService.uploadPhoto(upload, photo);
    },
    onSuccess: () => navigate("/"),
  });

  function handleClose() {
    navigate(themeId ? `/themes/${themeId}` : "/themes");
  }

  function handleGoHome() {
    navigate("/");
  }

  return { ...flow, handleClose, handleGoHome };
}
