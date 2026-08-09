import { useQueryClient } from "@tanstack/react-query";
import { essayService } from "../../../services/essay-service";
import { useEssayCaptureFlow } from "../../../flows/essayCapture/hooks/useEssayCaptureFlow";

/** Same capture flow as a brand new upload (ticket 06), pointed at `resend` instead — always "upload" mode, since the card only has a single "Tentar novamente" action, not separate camera/upload CTAs. */
export function useEssayResendFlow(essayId: string, onDone: () => void) {
  const queryClient = useQueryClient();

  return useEssayCaptureFlow({
    mode: "upload",
    onSubmit: async (photo) => {
      const { upload } = await essayService.resend(essayId);
      await essayService.uploadPhoto(upload, photo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["essays"] });
      onDone();
    },
  });
}
