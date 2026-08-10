import { useMutation, useQueryClient } from "@tanstack/react-query";
import { essayService } from "../../services/essayService";

interface ResendEssayInput {
  essayId: string;
  photo: File;
}

export function useResendEssay() {
  const queryClient = useQueryClient();
  const { mutate: resendEssay, mutateAsync: resendEssayAsync, ...rest } = useMutation({
    mutationFn: async ({ essayId, photo }: ResendEssayInput) => {
      const { upload } = await essayService.resend(essayId);
      await essayService.uploadPhoto(upload, photo);
      return { essayId };
    },
    onSuccess: (_data, { essayId }) => {
      // Also debits async on the same S3 event as a fresh upload — see `useUploadEssay`. `/me` is
      // left to `useEssays`/`useEssayDetail` to invalidate once the poll observes it.
      queryClient.invalidateQueries({ queryKey: ["essays"] });
      queryClient.invalidateQueries({ queryKey: ["essay", essayId] });
    },
  });

  return { resendEssay, resendEssayAsync, ...rest };
}
