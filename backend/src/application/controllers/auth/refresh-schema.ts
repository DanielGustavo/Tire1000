import { z } from "zod";
import { Schema } from "../schema.js";

const refreshBodySchema = z.object({
  refreshToken: z.string().min(1, "Refresh token é obrigatório"),
});

export type RefreshRequestBody = z.infer<typeof refreshBodySchema>;

export class RefreshSchema extends Schema<RefreshRequestBody> {
  protected readonly definition = refreshBodySchema;
}
