import { useQueryClient } from "@tanstack/react-query";
import { useResendEssay } from "../../../hooks/mutations/useResendEssay";
import { useEssayCaptureFlow } from "../../../flows/essayCapture/hooks/useEssayCaptureFlow";

/** Same capture flow as a brand new upload (ticket 06), pointed at `resend` instead — always "upload" mode, since the card only has a single "Tentar novamente" action, not separate camera/upload CTAs. */
export function useEssayResendFlow(essayId: string, onDone: () => void) {
  const queryClient = useQueryClient();
  const { resendEssayAsync } = useResendEssay();

  return useEssayCaptureFlow({
    mode: "upload",
    onSubmit: async (photo) => {
      await resendEssayAsync({ essayId, photo });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["essays"] });
      onDone();
    },
  });
}
