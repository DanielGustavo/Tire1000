import type { S3Handler } from "aws-lambda";
import { createEnqueueEssayValidation } from "../../../application/use-cases/enqueue-essay-validation/enqueue-essay-validation.js";
import { SqsEssayValidationQueueGateway } from "../../../infra/gateways/sqs-essay-validation-queue-gateway.js";
import { DynamoEssayRepository } from "../../../infra/repositories/dynamo-essay-repository.js";
import { DynamoUserRepository } from "../../../infra/repositories/dynamo-user-repository.js";

const enqueueEssayValidation = createEnqueueEssayValidation({
  essayRepository: new DynamoEssayRepository(),
  userRepository: new DynamoUserRepository(),
  essayValidationQueueGateway: new SqsEssayValidationQueueGateway(),
});

// S3 event notifications URL-encode the object key (spaces as "+", everything else percent-encoded).
export function decodeS3ObjectKey(key: string): string {
  return decodeURIComponent(key.replace(/\+/g, " "));
}

// Invoked directly by the S3 bucket's ObjectCreated notification — no httpApi event, no Controller.
export const handler: S3Handler = async (event) => {
  for (const record of event.Records) {
    await enqueueEssayValidation({ fileKey: decodeS3ObjectKey(record.s3.object.key) });
  }
};
