import type {
  EnqueueEssayValidationMessage,
  EssayValidationQueueGateway,
} from "../../../domain/contracts/gateways/essay-validation-queue-gateway.js";

export class InMemoryEssayValidationQueueGateway implements EssayValidationQueueGateway {
  readonly enqueuedMessages: EnqueueEssayValidationMessage[] = [];

  async enqueue(message: EnqueueEssayValidationMessage): Promise<void> {
    this.enqueuedMessages.push(message);
  }
}
