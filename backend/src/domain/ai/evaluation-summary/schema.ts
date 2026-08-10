import { z } from "zod";

export const evaluationSummaryResponseSchema = z.object({
  evaluationText: z.string(),
});

export type EvaluationSummaryResponse = z.infer<typeof evaluationSummaryResponseSchema>;
