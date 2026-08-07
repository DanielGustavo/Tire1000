export interface GeminiModel {
  model: string;
  /**
   * Rough estimate of this model's blended per-token price — good enough for the operator-facing cost
   * tracking the spec asks for (story 30), not a billing-accurate figure. Tune as pricing changes.
   */
  estimatedCentsPer1000Tokens: number;
}

export const GEMINI_MODELS = [
  { model: "gemini-3.6-flash", estimatedCentsPer1000Tokens: 0.15 },
  { model: "gemini-2.5-pro", estimatedCentsPer1000Tokens: 1.0 },
] as const satisfies readonly GeminiModel[];

export type GeminiModelId = (typeof GEMINI_MODELS)[number]["model"];
