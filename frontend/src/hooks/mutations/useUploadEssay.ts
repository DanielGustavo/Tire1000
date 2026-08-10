import { useMutation, useQueryClient } from "@tanstack/react-query";
import { essayService } from "../../services/essayService";

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
      // The credit debit is async (S3 upload-completed event, not this response) — invalidating
      // `/me` here would just refetch the still-stale balance. `useEssays`/`useEssayDetail` catch
      // the actual debit once their poll observes the essay leave UPLOADING.
      queryClient.invalidateQueries({ queryKey: ["essays"] });
    },
  });

  return { uploadEssay, uploadEssayAsync, ...rest };
}
