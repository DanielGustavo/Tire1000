import { useRef } from "react";
import { essayService } from "../../../services/essay-service";
import { useEssayCaptureFlow, type EssayUploadMode } from "../../essay-upload/useEssayCaptureFlow";

export function useEssayUploadFlow(themeId: string, mode: EssayUploadMode, onDone: (essayId: string) => void) {
  const essayIdRef = useRef<string | null>(null);

  return useEssayCaptureFlow({
    mode,
    onSubmit: async (photo) => {
      const { essayId, upload } = await essayService.upload(themeId);
      essayIdRef.current = essayId;
      await essayService.uploadPhoto(upload, photo);
    },
    onSuccess: () => onDone(essayIdRef.current!),
  });
}
