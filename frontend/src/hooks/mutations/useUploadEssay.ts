import { useMutation, useQueryClient } from "@tanstack/react-query";
import { essayService } from "../../services/essayService";
import { CURRENT_USER_QUERY_KEY } from "../../contexts/AuthContext";

interface UploadEssayInput {
  themeId: string;
  photo: File;
}

export function useUploadEssay() {
  const queryClient = useQueryClient();
  const { mutate: uploadEssay, mutateAsync: uploadEssayAsync, ...rest } = useMutation({
    mutationFn: async ({ themeId, photo }: UploadEssayInput) => {
      const { essayId, upload } = await essayService.upload(themeId);
      await essayService.uploadPhoto(upload, photo);
      return { essayId };
    },
    onSuccess: () => {
      // Consumes a credit server-side — keep `/me` and the essay list in sync.
      queryClient.invalidateQueries({ queryKey: CURRENT_USER_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["essays"] });
    },
  });

  return { uploadEssay, uploadEssayAsync, ...rest };
}
