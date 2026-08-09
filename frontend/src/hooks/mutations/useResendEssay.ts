import { useMutation } from "@tanstack/react-query";
import { essayService } from "../../services/essay-service";

interface ResendEssayInput {
  essayId: string;
  photo: File;
}

export function useResendEssay() {
  const { mutate: resendEssay, mutateAsync: resendEssayAsync, ...rest } = useMutation({
    mutationFn: async ({ essayId, photo }: ResendEssayInput) => {
      const { upload } = await essayService.resend(essayId);
      await essayService.uploadPhoto(upload, photo);
      return { essayId };
    },
  });

  return { resendEssay, resendEssayAsync, ...rest };
}
