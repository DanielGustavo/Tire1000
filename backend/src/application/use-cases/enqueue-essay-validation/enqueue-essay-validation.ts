import { essayIdFromFileKey, ESSAY_CREDIT_COST } from "../../../domain/entities/essay.js";
import type { EssayValidationQueueGateway } from "../../../domain/contracts/gateways/essay-validation-queue-gateway.js";
import type { EssayRepository } from "../../../domain/contracts/repositories/essay-repository.js";
import type { UserRepository } from "../../../domain/contracts/repositories/user-repository.js";

export interface EnqueueEssayValidationDeps {
  essayRepository: EssayRepository;
  userRepository: UserRepository;
  essayValidationQueueGateway: EssayValidationQueueGateway;
}

export interface EnqueueEssayValidationInput {
  fileKey: string;
}

export interface EnqueueEssayValidationOutput {
  enqueued: boolean;
}

/**
 * Consumer of the S3 trigger fired when the client finishes uploading an essay photo. Moves the
 * Essay from UPLOADING to QUEUED, debits the credit right there (not later, at Revisão — the fila
 * can take a while to drain) and hands it off to the fila de Revisão. Every branch that skips
 * enqueueing is a deliberate no-op (unknown/malformed key, missing essay, already past UPLOADING)
 * rather than an error — S3 event delivery is at-least-once, so redelivery of an event this
 * handler already processed must not double-enqueue or double-debit.
 *
 * Order matters here (mirrors ConfirmCreditsCheckout/ADR-0007): the essay's own conditional
 * transition runs *first*, since that's what guards against a truly concurrent redelivery of the
 * same S3 event double-debiting the user — only one invocation can win it. The credit debit runs
 * *second*, conditioned on the user's balance, to guard the separate case of two different essays
 * for the same user racing on a shared balance. If the debit loses that race (rare — needs two
 * uploads from the same under-funded user confirming near-simultaneously), the essay is marked
 * UPLOAD_FAILED instead of silently sitting in QUEUED without ever reaching the fila de Revisão.
 */
export function createEnqueueEssayValidation({
  essayRepository,
  userRepository,
  essayValidationQueueGateway,
}: EnqueueEssayValidationDeps) {
  return async function enqueueEssayValidation({ fileKey }: EnqueueEssayValidationInput): Promise<EnqueueEssayValidationOutput> {
    const essayId = essayIdFromFileKey(fileKey);
    if (!essayId) return { enqueued: false };

    const essay = await essayRepository.findById(essayId);
    if (!essay || essay.status !== "UPLOADING") return { enqueued: false };

    essay.markQueued();
    const { applied: queued } = await essayRepository.updateStatus(essay, { expectedCurrentStatus: "UPLOADING" });
    if (!queued) return { enqueued: false };

    const { applied: debited } = await userRepository.decrementCredits(essay.userId, ESSAY_CREDIT_COST);
    if (!debited) {
      essay.markUploadFailed();
      await essayRepository.updateStatus(essay, { expectedCurrentStatus: "QUEUED" });
      return { enqueued: false };
    }

    await essayValidationQueueGateway.enqueue({ essayId: essay.id });
    return { enqueued: true };
  };
}
