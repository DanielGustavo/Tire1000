import { essayService } from "../../../services/essay-service";
import { useEssayCaptureFlow, type EssayUploadMode } from "../../essay-upload/useEssayCaptureFlow";

export function useEssayUploadFlow(themeId: string, mode: EssayUploadMode, onDone: () => void) {
  return useEssayCaptureFlow({
    mode,
    onSubmit: async (photo) => {
      const { upload } = await essayService.upload(themeId);
      await essayService.uploadPhoto(upload, photo);
    },
    onSuccess: onDone,
  });
}
