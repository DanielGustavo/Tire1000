import { GEMINI_MODELS, type GeminiModelId } from "../models.js";

export function estimateAmountInCents(tokens: number, model: GeminiModelId): number {
  const { estimatedCentsPer1000Tokens } = GEMINI_MODELS.find((entry) => entry.model === model)!;
  return Math.round((tokens / 1000) * estimatedCentsPer1000Tokens * 100) / 100;
}
