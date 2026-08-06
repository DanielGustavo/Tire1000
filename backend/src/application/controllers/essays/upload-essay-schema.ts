import { z } from "zod";
import { Schema } from "../schema.js";

const uploadEssayBodySchema = z.object({
  themeId: z.string().min(1, "themeId é obrigatório"),
});

export type UploadEssayRequestBody = z.infer<typeof uploadEssayBodySchema>;

export class UploadEssaySchema extends Schema<UploadEssayRequestBody> {
  protected readonly definition = uploadEssayBodySchema;
}
