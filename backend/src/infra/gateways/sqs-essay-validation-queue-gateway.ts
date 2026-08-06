import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import type {
  EnqueueEssayValidationMessage,
  EssayValidationQueueGateway,
} from "../../domain/contracts/gateways/essay-validation-queue-gateway.js";

export class SqsEssayValidationQueueGateway implements EssayValidationQueueGateway {
  constructor(
    private readonly queueUrl: string = process.env.ESSAY_VALIDATION_QUEUE_URL ?? "",
    private readonly client: SQSClient = new SQSClient({}),
  ) {}

  async enqueue(message: EnqueueEssayValidationMessage): Promise<void> {
    await this.client.send(
      new SendMessageCommand({ QueueUrl: this.queueUrl, MessageBody: JSON.stringify(message) }),
    );
  }
}
