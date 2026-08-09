import { useMutation } from "@tanstack/react-query";
import { essayService } from "../../services/essayService";

interface UploadEssayInput {
  themeId: string;
  photo: File;
}

export function useUploadEssay() {
  const { mutate: uploadEssay, mutateAsync: uploadEssayAsync, ...rest } = useMutation({
    mutationFn: async ({ themeId, photo }: UploadEssayInput) => {
      const { essayId, upload } = await essayService.upload(themeId);
      await essayService.uploadPhoto(upload, photo);
      return { essayId };
    },
  });

  return { uploadEssay, uploadEssayAsync, ...rest };
}
