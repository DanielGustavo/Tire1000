import { describe, expect, it } from "vitest";
import { Essay, type EssayProps } from "../../../domain/entities/essay.js";
import { InMemoryEssayCostRepository } from "../../../infra/repositories/fakes/in-memory-essay-cost-repository.js";
import { InMemoryEssayEvaluationRepository } from "../../../infra/repositories/fakes/in-memory-essay-evaluation-repository.js";
import { InMemoryEssayRepository } from "../../../infra/repositories/fakes/in-memory-essay-repository.js";
import { InMemoryDevAlertGateway } from "../../../infra/gateways/fakes/in-memory-dev-alert-gateway.js";
import { InMemoryEssayEvaluationGateway } from "../../../infra/gateways/fakes/in-memory-essay-evaluation-gateway.js";
import { SequentialIdGenerator } from "../../../infra/gateways/fakes/sequential-id-generator.js";
import { createEvaluateEssay } from "./evaluate-essay.js";

function buildEssay(overrides: Partial<EssayProps> = {}): Essay {
  return Essay.reconstitute({
    id: "essay-1",
    status: "VALIDATED",
    validationAttempts: 1,
    rejectedAttempts: 0,
    rejectionReasons: [],
    fileKey: null,
    textContent: "Era uma vez uma redação sobre educação financeira no Brasil.",
    evaluationAttempts: 0,
    finalScore: null,
    userId: "user-1",
    themeId: "theme-1",
    themeTitle: "A importância da educação financeira no Brasil",
    topicColor: "#2E7D32",
    createdAt: new Date("2026-08-01T00:00:00.000Z"),
    updatedAt: new Date("2026-08-01T00:00:00.000Z"),
    ...overrides,
  });
}

async function buildDeps({ essay = buildEssay() }: { essay?: Essay | null } = {}) {
  const essayRepository = new InMemoryEssayRepository();
  if (essay) await essayRepository.create(essay);

  return {
    essayRepository,
    essayEvaluationRepository: new InMemoryEssayEvaluationRepository(),
    essayCostRepository: new InMemoryEssayCostRepository(),
    essayEvaluationGateway: new InMemoryEssayEvaluationGateway(),
    devAlertGateway: new InMemoryDevAlertGateway(),
    idGenerator: new SequentialIdGenerator(),
  };
}

describe("EvaluateEssay", () => {
  describe("success", () => {
    it("scores the essay: EssayEvaluation saved, finalScore set, status SUCCESS, cost recorded", async () => {
      const deps = await buildDeps();
      deps.essayEvaluationGateway.queueResult({
        scores: {
          C1: { score: 160, evaluationText: "Bom domínio da norma culta." },
          C2: { score: 160, evaluationText: "Bom desenvolvimento do tema." },
          C3: { score: 120, evaluationText: "Argumentação mediana." },
          C4: { score: 160, evaluationText: "Boa coesão." },
          C5: { score: 160, evaluationText: "Boa proposta de intervenção." },
          final: { score: 760, evaluationText: "Parecer geral consolidado." },
        },
        highlights: [{ type: "C2", anchorIndex: 0, endIndex: 8, textContent: "Era uma" }],
        tokens: 3000,
        amountInCents: 37.5,
      });
      const evaluateEssay = createEvaluateEssay(deps);

      const result = await evaluateEssay({ essayId: "essay-1" });

      expect(result).toEqual({ outcome: "EVALUATED" });
      await expect(deps.essayRepository.findById("essay-1")).resolves.toMatchObject({
        status: "SUCCESS",
        finalScore: 760,
        evaluationAttempts: 1,
      });
      await expect(deps.essayEvaluationRepository.findByEssayId("essay-1")).resolves.toMatchObject({
        essayId: "essay-1",
        scores: { final: { score: 760, evaluationText: "Parecer geral consolidado." } },
        highlights: [{ type: "C2", anchorIndex: 0, endIndex: 8, textContent: "Era uma" }],
      });
      expect(deps.essayCostRepository.created).toMatchObject([
        { essayId: "essay-1", userId: "user-1", step: "EVALUATION", tokens: 3000, amountInCents: 37.5 },
      ]);
    });

    it("passes the essay's textContent and themeTitle to the gateway", async () => {
      const deps = await buildDeps();
      deps.essayEvaluationGateway.queueResult();
      const evaluateEssay = createEvaluateEssay(deps);

      await evaluateEssay({ essayId: "essay-1" });

      expect(deps.essayEvaluationGateway.calls).toEqual([
        { textContent: "Era uma vez uma redação sobre educação financeira no Brasil.", themeTitle: "A importância da educação financeira no Brasil" },
      ]);
    });
  });

  describe("system failure", () => {
    it("retries transparently on the 1st and 2nd failed attempts — no credit refund attempted, no alert, error rethrown", async () => {
      const deps = await buildDeps();
      deps.essayEvaluationGateway.queueFailure();
      const evaluateEssay = createEvaluateEssay(deps);

      await expect(evaluateEssay({ essayId: "essay-1" })).rejects.toThrow("Gemini indisponível");

      await expect(deps.essayRepository.findById("essay-1")).resolves.toMatchObject({
        status: "EVALUATING",
        evaluationAttempts: 1,
      });
      expect(deps.devAlertGateway.alerts).toEqual([]);

      // 2nd delivery of the same SQS message — essay is now EVALUATING, not VALIDATED.
      deps.essayEvaluationGateway.queueFailure();
      await expect(evaluateEssay({ essayId: "essay-1" })).rejects.toThrow("Gemini indisponível");
      await expect(deps.essayRepository.findById("essay-1")).resolves.toMatchObject({
        status: "EVALUATING",
        evaluationAttempts: 2,
      });
      expect(deps.devAlertGateway.alerts).toEqual([]);
    });

    it("on the 3rd failed attempt, marks EVALUATION_FAILED, does NOT refund the credit (ADR-0001), alerts the dev, and still rethrows (so SQS also moves it to the DLQ)", async () => {
      const deps = await buildDeps({ essay: buildEssay({ status: "EVALUATING", evaluationAttempts: 2 }) });
      deps.essayEvaluationGateway.queueFailure(new Error("timeout"));
      const evaluateEssay = createEvaluateEssay(deps);

      await expect(evaluateEssay({ essayId: "essay-1" })).rejects.toThrow("timeout");

      await expect(deps.essayRepository.findById("essay-1")).resolves.toMatchObject({
        status: "EVALUATION_FAILED",
        evaluationAttempts: 0,
      });
      expect(deps.essayCostRepository.created).toEqual([]);
      expect(deps.devAlertGateway.alerts).toMatchObject([{ subject: "Falha de sistema na Avaliação" }]);
    });
  });

  describe("no-op guards", () => {
    it("is a no-op when the essay doesn't exist", async () => {
      const deps = await buildDeps({ essay: null });
      const evaluateEssay = createEvaluateEssay(deps);

      await expect(evaluateEssay({ essayId: "missing-essay" })).resolves.toEqual({ outcome: "SKIPPED" });
    });

    it.each(["REJECTED", "VALIDATION_FAILED", "SUCCESS", "EVALUATION_FAILED", "UPLOADING"] as const)(
      "is a no-op when the essay is already %s (duplicate SQS delivery after this essay's Avaliação finished, or not ready yet)",
      async (status) => {
        const deps = await buildDeps({ essay: buildEssay({ status }) });
        const evaluateEssay = createEvaluateEssay(deps);

        const result = await evaluateEssay({ essayId: "essay-1" });

        expect(result).toEqual({ outcome: "SKIPPED" });
        expect(deps.essayEvaluationGateway.calls).toEqual([]);
      },
    );

    it("is a no-op when the essay has no textContent (shouldn't happen once VALIDATED, but defends against a corrupt state)", async () => {
      const deps = await buildDeps({ essay: buildEssay({ textContent: null }) });
      const evaluateEssay = createEvaluateEssay(deps);

      const result = await evaluateEssay({ essayId: "essay-1" });

      expect(result).toEqual({ outcome: "SKIPPED" });
    });
  });
});
