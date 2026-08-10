import { EVALUATION_COMPETENCIES } from "../../domain/ai/evaluation/competencies.js";
import { buildEvaluationPrompt } from "../../domain/ai/evaluation/prompt.js";
import { evaluationCompetencyResponseSchema } from "../../domain/ai/evaluation/schema.js";
import { buildEvaluationSummaryPrompt } from "../../domain/ai/evaluation-summary/prompt.js";
import { evaluationSummaryResponseSchema } from "../../domain/ai/evaluation-summary/schema.js";
import type { EssayEvaluationGateway, EssayEvaluationResult } from "../../domain/contracts/gateways/essay-evaluation-gateway.js";
import type { CompetencyId, CompetencyScore, EssayEvaluationScores, EssayHighlight } from "../../domain/entities/essay-evaluation.js";
import { callGeminiModel } from "../ai/gemini/utils/call-model.js";
import { locateHighlight } from "../ai/gemini/utils/locate-highlight.js";
import { EVALUATION_MODEL } from "../ai/gemini/evaluation-model.js";

/** score = sum of the 5 competências (max 1000). */
function sumCompetencyScores(scores: Record<CompetencyId, CompetencyScore>): number {
  return EVALUATION_COMPETENCIES.reduce((total, competency) => total + scores[competency.id].score, 0);
}

export class GeminiEssayEvaluationGateway implements EssayEvaluationGateway {
  async evaluate(textContent: string, themeTitle: string): Promise<EssayEvaluationResult> {
    // One prompt per competência, evaluated independently (spec) — run concurrently so 5 Gemini
    // calls fit inside the fila de Avaliação consumer's timeout (see sls/functions/essays.yml).
    const calls = await Promise.all(
      EVALUATION_COMPETENCIES.map(async (competency) => {
        const prompt = buildEvaluationPrompt({ competency, themeTitle, textContent });
        const { data, tokens, amountInCents } = await callGeminiModel({
          model: EVALUATION_MODEL,
          prompt,
          schema: evaluationCompetencyResponseSchema,
        });
        return { competency, data, tokens, amountInCents };
      }),
    );

    let tokens = 0;
    let amountInCents = 0;
    const highlights: EssayHighlight[] = [];
    const scores = {} as Record<CompetencyId, CompetencyScore>;

    for (const call of calls) {
      tokens += call.tokens;
      amountInCents += call.amountInCents;
      scores[call.competency.id] = { score: call.data.score, evaluationText: call.data.evaluationText };

      for (const highlight of call.data.highlights) {
        const located = locateHighlight(textContent, highlight.quote);
        if (!located) continue;
        highlights.push({ type: call.competency.id, textContent: highlight.textContent, ...located });
      }
    }

    // Runs sequentially after the 5 competência calls (which stay parallel among themselves) — same
    // consumer/timeout budget (see sls/functions/essays.yml), needs their results as input.
    const summary = await callGeminiModel({
      model: EVALUATION_MODEL,
      prompt: buildEvaluationSummaryPrompt({ themeTitle, scores }),
      schema: evaluationSummaryResponseSchema,
    });
    tokens += summary.tokens;
    amountInCents += summary.amountInCents;

    const final: CompetencyScore = { score: sumCompetencyScores(scores), evaluationText: summary.data.evaluationText };

    return {
      scores: { ...scores, final } as EssayEvaluationScores,
      highlights,
      tokens,
      amountInCents: Math.round(amountInCents * 100) / 100,
    };
  }
}
