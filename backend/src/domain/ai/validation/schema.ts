import { z } from "zod";
import { ESSAY_REJECTION_REASONS } from "../../entities/essay.js";

export const validationResponseSchema = z.object({
  outcome: z.enum(["APPROVED", "REJECTED"]),
  textContent: z.string().nullable().optional(),
  reasons: z.array(z.enum(ESSAY_REJECTION_REASONS)).nullable().optional(),
});

export type ValidationResponse = z.infer<typeof validationResponseSchema>;
