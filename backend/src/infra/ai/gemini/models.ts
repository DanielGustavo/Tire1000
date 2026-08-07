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
  // qualitativo contra uma grade de critérios, não só OCR + checagens objetivas. "gemini-3.6-pro" não
  // existe — a linha 3.6 só tem variante flash; "gemini-pro-latest" é o alias estável mantido pela
  // Google pro modelo "pro" mais recente disponível (hoje resolve pra gemini-3.1-pro), então não
  // fica preso a um "-preview" que pode ser descontinuado sem aviso.
  { model: "gemini-pro-latest", estimatedCentsPer1000Tokens: 1.25 },
] as const satisfies readonly GeminiModel[];

export type GeminiModelId = (typeof GEMINI_MODELS)[number]["model"];
