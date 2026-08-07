import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import type {
  EnqueueEssayEvaluationMessage,
  EssayEvaluationQueueGateway,
} from "../../domain/contracts/gateways/essay-evaluation-queue-gateway.js";

export class SqsEssayEvaluationQueueGateway implements EssayEvaluationQueueGateway {
  constructor(
    private readonly queueUrl: string = process.env.ESSAY_EVALUATION_QUEUE_URL ?? "",
    private readonly client: SQSClient = new SQSClient({}),
  ) {}

  async enqueue(message: EnqueueEssayEvaluationMessage): Promise<void> {
    await this.client.send(new SendMessageCommand({ QueueUrl: this.queueUrl, MessageBody: JSON.stringify(message) }));
  }
}
