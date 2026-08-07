import type {
  EnqueueEssayEvaluationMessage,
  EssayEvaluationQueueGateway,
} from "../../../domain/contracts/gateways/essay-evaluation-queue-gateway.js";

export class InMemoryEssayEvaluationQueueGateway implements EssayEvaluationQueueGateway {
  readonly enqueuedMessages: EnqueueEssayEvaluationMessage[] = [];

  async enqueue(message: EnqueueEssayEvaluationMessage): Promise<void> {
    this.enqueuedMessages.push(message);
  }
}
