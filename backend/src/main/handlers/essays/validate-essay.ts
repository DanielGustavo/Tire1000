import type { SQSHandler } from "aws-lambda";
import { createValidateEssay } from "../../../application/use-cases/validate-essay/validate-essay.js";
import { SnsDevAlertGateway } from "../../../infra/gateways/sns-dev-alert-gateway.js";
import { GeminiEssayValidationGateway } from "../../../infra/gateways/gemini-essay-validation-gateway.js";
import { KsuidIdGenerator } from "../../../infra/gateways/ksuid-id-generator.js";
import { S3EssayStorageGateway } from "../../../infra/gateways/s3-essay-storage-gateway.js";
import { SqsEssayEvaluationQueueGateway } from "../../../infra/gateways/sqs-essay-evaluation-queue-gateway.js";
import { DynamoEssayCostRepository } from "../../../infra/repositories/dynamo-essay-cost-repository.js";
import { DynamoEssayRepository } from "../../../infra/repositories/dynamo-essay-repository.js";
import { DynamoUserRepository } from "../../../infra/repositories/dynamo-user-repository.js";

const validateEssay = createValidateEssay({
  essayRepository: new DynamoEssayRepository(),
  userRepository: new DynamoUserRepository(),
  essayCostRepository: new DynamoEssayCostRepository(),
  essayStorageGateway: new S3EssayStorageGateway(),
  essayValidationGateway: new GeminiEssayValidationGateway(),
  essayEvaluationQueueGateway: new SqsEssayEvaluationQueueGateway(),
  devAlertGateway: new SnsDevAlertGateway(),
  idGenerator: new KsuidIdGenerator(),
});

// Consumer of the fila de Revisão (EssayValidationQueue). Batch size is 1 (see sls/functions/essays.yml)
// so one message's failure can't block another essay's — letting the error propagate is what makes the
// queue's own RedrivePolicy (maxReceiveCount: 3) retry and, on the last attempt, move it to the DLQ.
export const handler: SQSHandler = async (event) => {
  for (const record of event.Records) {
    const { essayId } = JSON.parse(record.body) as { essayId: string };
    await validateEssay({ essayId });
  }
};
