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
  // Avaliação usa um modelo mais caro/capaz que a Revisão (ver CONTEXT.md) — a tarefa exige julgamento
  // qualitativo contra uma grade de critérios, não só OCR + checagens objetivas.
  { model: "gemini-3.6-pro", estimatedCentsPer1000Tokens: 1.25 },
] as const satisfies readonly GeminiModel[];

export type GeminiModelId = (typeof GEMINI_MODELS)[number]["model"];
