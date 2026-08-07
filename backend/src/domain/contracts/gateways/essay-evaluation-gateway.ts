import type { EssayEvaluationScores, EssayHighlight } from "../../entities/essay-evaluation.js";

export interface EssayEvaluationResult {
  scores: EssayEvaluationScores;
  highlights: EssayHighlight[];
  tokens: number;
  amountInCents: number;
}

/**
 * Gemini, wrapped for the fila de Avaliação (EvaluateEssay). Internally issues 5 prompts — one per
 * competência do Enem, avaliada independentemente — and aggregates them into a single result (final
 * score/parecer, combined token usage and cost) so the use case makes a single call, same shape as
 * EssayValidationGateway#validate.
 */
export interface EssayEvaluationGateway {
  evaluate(textContent: string, themeTitle: string): Promise<EssayEvaluationResult>;
}
