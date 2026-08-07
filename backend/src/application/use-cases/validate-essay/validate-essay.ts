import {
  ESSAY_CREDIT_COST,
  ESSAY_REJECTED_ATTEMPTS_ALERT_THRESHOLD,
  MAX_ESSAY_VALIDATION_ATTEMPTS,
  REVALIDATABLE_ESSAY_STATUSES,
} from "../../../domain/entities/essay.js";
import { EssayCost } from "../../../domain/entities/essay-cost.js";
import type { DevAlertGateway } from "../../../domain/contracts/gateways/dev-alert-gateway.js";
import type { EssayEvaluationQueueGateway } from "../../../domain/contracts/gateways/essay-evaluation-queue-gateway.js";
import type { EssayStorageGateway } from "../../../domain/contracts/gateways/essay-storage-gateway.js";
import type { EssayValidationGateway } from "../../../domain/contracts/gateways/essay-validation-gateway.js";
import type { IdGenerator } from "../../../domain/contracts/gateways/id-generator.js";
import type { EssayCostRepository } from "../../../domain/contracts/repositories/essay-cost-repository.js";
import type { EssayRepository } from "../../../domain/contracts/repositories/essay-repository.js";
import type { UserRepository } from "../../../domain/contracts/repositories/user-repository.js";

export interface ValidateEssayDeps {
  essayRepository: EssayRepository;
  userRepository: UserRepository;
  essayCostRepository: EssayCostRepository;
  essayStorageGateway: EssayStorageGateway;
  essayValidationGateway: EssayValidationGateway;
  essayEvaluationQueueGateway: EssayEvaluationQueueGateway;
  devAlertGateway: DevAlertGateway;
  idGenerator: IdGenerator;
}

export interface ValidateEssayInput {
  essayId: string;
}

/**
 * No SYSTEM_FAILURE member here — a Gemini/system failure always rethrows (see below), whether it's
 * transparently retried or terminal, so it never reaches a `return`. Callers observe it as a thrown
 * error, not as a value in this union.
 */
export type ValidateEssayOutcome = "APPROVED" | "REJECTED" | "SKIPPED";

export interface ValidateEssayOutput {
  outcome: ValidateEssayOutcome;
}

/**
 * Consumer of the fila de Revisão. Invoked once per SQS delivery (up to MAX_ESSAY_VALIDATION_ATTEMPTS,
 * matching the queue's own RedrivePolicy — see sls/resources/essays.yml), so it doubles as its own
 * retry-attempt tracker via `Essay#markValidating`: on the delivery that reaches the max, a Gemini/system
 * failure is treated as terminal (VALIDATION_FAILED, refund, dev alert) *and* still rethrown, so SQS's
 * own redrive also moves the message to the DLQ — bookkeeping and DLQ placement happen on the same attempt,
 * not one instead of the other.
 *
 * Every branch that skips processing (essay missing, status outside REVALIDATABLE_ESSAY_STATUSES, missing
 * `fileKey` — which is how a VALIDATION_FAILED essay still ends up skipped despite being in that set, see
 * its doc comment — or lost the conditional transition to a concurrent delivery) is a deliberate no-op,
 * same reasoning as EnqueueEssayValidation.
 */
export function createValidateEssay({
  essayRepository,
  userRepository,
  essayCostRepository,
  essayStorageGateway,
  essayValidationGateway,
  essayEvaluationQueueGateway,
  devAlertGateway,
  idGenerator,
}: ValidateEssayDeps) {
  return async function validateEssay({ essayId }: ValidateEssayInput): Promise<ValidateEssayOutput> {
    const essay = await essayRepository.findById(essayId);
    if (!essay || !REVALIDATABLE_ESSAY_STATUSES.includes(essay.status)) return { outcome: "SKIPPED" };

    const fileKey = essay.fileKey;
    if (!fileKey) return { outcome: "SKIPPED" };

    const expectedCurrentStatus = essay.status;
    essay.markValidating();
    const { applied } = await essayRepository.updateStatus(essay, { expectedCurrentStatus });
    if (!applied) return { outcome: "SKIPPED" };

    try {
      const photo = await essayStorageGateway.getObject(fileKey);
      const result = await essayValidationGateway.validate(photo);

      const costId = await idGenerator.generate();
      await essayCostRepository.create(
        EssayCost.create({
          id: costId,
          essayId: essay.id,
          userId: essay.userId,
          step: "VALIDATION",
          tokens: result.tokens,
          amountInCents: result.amountInCents,
        }),
      );

      if (result.outcome === "APPROVED") {
        essay.markValidated(result.textContent);
        await essayRepository.updateStatus(essay, { expectedCurrentStatus: "VALIDATING" });
        await essayStorageGateway.deleteObject(fileKey);
        await essayEvaluationQueueGateway.enqueue({ essayId: essay.id });
        return { outcome: "APPROVED" };
      }

      essay.markRejected(result.reasons);
      await essayRepository.updateStatus(essay, { expectedCurrentStatus: "VALIDATING" });
      await essayStorageGateway.deleteObject(fileKey);
      await userRepository.incrementCredits(essay.userId, ESSAY_CREDIT_COST);

      if (essay.rejectedAttempts > ESSAY_REJECTED_ATTEMPTS_ALERT_THRESHOLD) {
        await devAlertGateway.alert({
          subject: "Usuário com muitas redações rejeitadas na Revisão",
          message: `Usuário ${essay.userId} acumulou ${essay.rejectedAttempts} tentativas rejeitadas na Revisão.`,
        });
      }

      return { outcome: "REJECTED" };
    } catch (error) {
      if (essay.validationAttempts < MAX_ESSAY_VALIDATION_ATTEMPTS) throw error;

      essay.markValidationFailed();
      await essayRepository.updateStatus(essay, { expectedCurrentStatus: "VALIDATING" });
      await essayStorageGateway.deleteObject(fileKey);
      await userRepository.incrementCredits(essay.userId, ESSAY_CREDIT_COST);
      await devAlertGateway.alert({
        subject: "Falha de sistema na Revisão",
        message: `Redação ${essay.id} falhou na Revisão após ${MAX_ESSAY_VALIDATION_ATTEMPTS} tentativas: ${(error as Error).message}`,
      });

      throw error;
    }
  };
}
