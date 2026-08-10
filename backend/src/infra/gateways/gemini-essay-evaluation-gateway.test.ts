import { beforeEach, describe, expect, it, vi } from "vitest";
import { evaluationSummaryResponseSchema } from "../../domain/ai/evaluation-summary/schema.js";
import { GeminiEssayEvaluationGateway } from "./gemini-essay-evaluation-gateway.js";

const { callGeminiModel } = vi.hoisted(() => ({ callGeminiModel: vi.fn() }));
vi.mock("../ai/gemini/utils/call-model.js", () => ({ callGeminiModel }));

function competencyResult() {
  return { data: { score: 160, evaluationText: "Bom domínio, com poucos desvios.", highlights: [] }, tokens: 100, amountInCents: 1 };
}

describe("GeminiEssayEvaluationGateway", () => {
  beforeEach(() => {
    callGeminiModel.mockReset();
  });

  it("gets the parecer geral from a 6th sequential call instead of concatenating the 5 pareceres de competência, keeping the final score as their local sum", async () => {
    callGeminiModel.mockImplementation(async ({ schema }) => {
      if (schema === evaluationSummaryResponseSchema) {
        return { data: { evaluationText: "Parecer geral sintetizado pela IA." }, tokens: 50, amountInCents: 0.5 };
      }
      return competencyResult();
    });

    const result = await new GeminiEssayEvaluationGateway().evaluate("texto da redação", "Tema X");

    expect(result.scores.final).toEqual({ score: 800, evaluationText: "Parecer geral sintetizado pela IA." });
    expect(callGeminiModel).toHaveBeenCalledTimes(6);
    expect(result.tokens).toBe(550);
    expect(result.amountInCents).toBe(5.5);
  });

  it("propagates a failure of the summary call the same way a failed competência call would", async () => {
    callGeminiModel.mockImplementation(async ({ schema }) => {
      if (schema === evaluationSummaryResponseSchema) throw new Error("Gemini indisponível");
      return competencyResult();
    });

    await expect(new GeminiEssayEvaluationGateway().evaluate("texto da redação", "Tema X")).rejects.toThrow("Gemini indisponível");
  });
});
