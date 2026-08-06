import { essayIdFromFileKey } from "../../../domain/entities/essay.js";
import type { EssayValidationQueueGateway } from "../../../domain/contracts/gateways/essay-validation-queue-gateway.js";
import type { EssayRepository } from "../../../domain/contracts/repositories/essay-repository.js";

export interface EnqueueEssayValidationDeps {
  essayRepository: EssayRepository;
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
 * Essay from UPLOADING to QUEUED and hands it off to the fila de Revisão. Every branch that skips
 * enqueueing is a deliberate no-op (unknown/malformed key, missing essay, already past UPLOADING)
 * rather than an error — S3 event delivery is at-least-once, so redelivery of an event this
 * handler already processed must not double-enqueue.
 */
export function createEnqueueEssayValidation({ essayRepository, essayValidationQueueGateway }: EnqueueEssayValidationDeps) {
  return async function enqueueEssayValidation({ fileKey }: EnqueueEssayValidationInput): Promise<EnqueueEssayValidationOutput> {
    const essayId = essayIdFromFileKey(fileKey);
    if (!essayId) return { enqueued: false };

    const essay = await essayRepository.findById(essayId);
    if (!essay || essay.status !== "UPLOADING") return { enqueued: false };

    essay.markQueued();
    const { applied } = await essayRepository.updateStatus(essay, { expectedCurrentStatus: "UPLOADING" });
    if (!applied) return { enqueued: false };

    await essayValidationQueueGateway.enqueue({ essayId: essay.id });
    return { enqueued: true };
  };
}
