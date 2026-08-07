import {
  MAX_ESSAY_EVALUATION_ATTEMPTS,
  REEVALUATABLE_ESSAY_STATUSES,
} from "../../../domain/entities/essay.js";
import { EssayCost } from "../../../domain/entities/essay-cost.js";
import { EssayEvaluation } from "../../../domain/entities/essay-evaluation.js";
import type { DevAlertGateway } from "../../../domain/contracts/gateways/dev-alert-gateway.js";
import type { EssayEvaluationGateway } from "../../../domain/contracts/gateways/essay-evaluation-gateway.js";
import type { IdGenerator } from "../../../domain/contracts/gateways/id-generator.js";
import type { EssayCostRepository } from "../../../domain/contracts/repositories/essay-cost-repository.js";
import type { EssayEvaluationRepository } from "../../../domain/contracts/repositories/essay-evaluation-repository.js";
import type { EssayRepository } from "../../../domain/contracts/repositories/essay-repository.js";

export interface EvaluateEssayDeps {
  essayRepository: EssayRepository;
  essayEvaluationRepository: EssayEvaluationRepository;
  essayCostRepository: EssayCostRepository;
  essayEvaluationGateway: EssayEvaluationGateway;
  devAlertGateway: DevAlertGateway;
  idGenerator: IdGenerator;
}

export interface EvaluateEssayInput {
  essayId: string;
}

/**
 * No SYSTEM_FAILURE member here, same reasoning as ValidateEssayOutcome — a Gemini/system failure
 * always rethrows, so it's observed as a thrown error, never as a value in this union.
 */
export type EvaluateEssayOutcome = "EVALUATED" | "SKIPPED";

export interface EvaluateEssayOutput {
  outcome: EvaluateEssayOutcome;
}

/**
 * Consumer of the fila de Avaliação. Same delivery-count-as-attempt-tracker design as ValidateEssay
 * (see its docstring) via `Essay#markEvaluating`, but with one key difference (ADR-0001): a terminal
 * system failure here does **not** refund the credit — the essay is reprocessed from its already-
 * extracted textContent after the team fixes the error, not resent by the user, so there's no
 * userRepository dependency at all.
 */
export function createEvaluateEssay({
  essayRepository,
  essayEvaluationRepository,
  essayCostRepository,
  essayEvaluationGateway,
  devAlertGateway,
  idGenerator,
}: EvaluateEssayDeps) {
  return async function evaluateEssay({
    essayId,
  }: EvaluateEssayInput): Promise<EvaluateEssayOutput> {
    const essay = await essayRepository.findById(essayId);
    if (!essay || !REEVALUATABLE_ESSAY_STATUSES.includes(essay.status))
      return { outcome: "SKIPPED" };

    const textContent = essay.textContent;
    if (!textContent) return { outcome: "SKIPPED" };

    const expectedCurrentStatus = essay.status;
    essay.markEvaluating();
    const { applied } = await essayRepository.updateStatus(essay, {
      expectedCurrentStatus,
    });
    if (!applied) return { outcome: "SKIPPED" };

    try {
      const result = await essayEvaluationGateway.evaluate(
        textContent,
        essay.themeTitle,
      );

      const costId = await idGenerator.generate();
      await essayCostRepository.create(
        EssayCost.create({
          id: costId,
          essayId: essay.id,
          userId: essay.userId,
          step: "EVALUATION",
          tokens: result.tokens,
          amountInCents: result.amountInCents,
        }),
      );

      await essayEvaluationRepository.create(
        EssayEvaluation.create({
          essayId: essay.id,
          scores: result.scores,
          highlights: result.highlights,
        }),
      );

      essay.markEvaluated(result.scores.final.score);
      await essayRepository.updateStatus(essay, {
        expectedCurrentStatus: "EVALUATING",
      });

      return { outcome: "EVALUATED" };
    } catch (error) {
      if (essay.evaluationAttempts < MAX_ESSAY_EVALUATION_ATTEMPTS) throw error;

      essay.markEvaluationFailed();
      await essayRepository.updateStatus(essay, {
        expectedCurrentStatus: "EVALUATING",
      });
      await devAlertGateway.alert({
        subject: "Falha de sistema na Avaliação",
        message: `Redação ${essay.id} falhou na Avaliação após ${MAX_ESSAY_EVALUATION_ATTEMPTS} tentativas: ${(error as Error).message}`,
      });

      throw error;
    }
  };
}
