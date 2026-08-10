import { useMutation, useQueryClient } from "@tanstack/react-query";
import { essayService } from "../../services/essayService";
import { CURRENT_USER_QUERY_KEY } from "../../contexts/AuthContext";

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
      // Also consumes a credit server-side — keep `/me`, the essay list, and this essay's detail in sync.
      queryClient.invalidateQueries({ queryKey: CURRENT_USER_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["essays"] });
      queryClient.invalidateQueries({ queryKey: ["essay", essayId] });
    },
  });

  return { resendEssay, resendEssayAsync, ...rest };
}
