import { useRef } from "react";
import { toast } from "sonner";
import { applyFieldErrors } from "../../../libs/axios";
import { essayService } from "../../../services/essay-service";
import { useEssayCaptureFlow, type EssayUploadMode } from "../../../flows/essayCapture/hooks/useEssayCaptureFlow";

export function useEssayUploadFlow(themeId: string, mode: EssayUploadMode, onDone: (essayId: string) => void) {
  const essayIdRef = useRef<string | null>(null);

  return useEssayCaptureFlow({
    mode,
    onSubmit: async (photo) => {
      try {
        const { essayId, upload } = await essayService.upload(themeId);
        essayIdRef.current = essayId;
        await essayService.uploadPhoto(upload, photo);
      } catch (error) {
        // No form fields to attach `fieldErrors` to here — `PhotoConfirmationErrorModal`
        // (rendered by the caller on `submitMutation.isError`) covers the generic "something
        // went wrong, try later" UI; the toast surfaces the specific reason on top of it.
        const { toastMessage } = applyFieldErrors(error, "Não foi possível enviar sua redação. Tente novamente.");
        if (toastMessage) toast.error(toastMessage);
        throw error;
      }
    },
    onSuccess: () => onDone(essayIdRef.current!),
  });
}
