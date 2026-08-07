import type { SQSHandler } from "aws-lambda";
import { createEvaluateEssay } from "../../../application/use-cases/evaluate-essay/evaluate-essay.js";
import { SnsDevAlertGateway } from "../../../infra/gateways/sns-dev-alert-gateway.js";
import { GeminiEssayEvaluationGateway } from "../../../infra/gateways/gemini-essay-evaluation-gateway.js";
import { KsuidIdGenerator } from "../../../infra/gateways/ksuid-id-generator.js";
import { DynamoEssayCostRepository } from "../../../infra/repositories/dynamo-essay-cost-repository.js";
import { DynamoEssayEvaluationRepository } from "../../../infra/repositories/dynamo-essay-evaluation-repository.js";
import { DynamoEssayRepository } from "../../../infra/repositories/dynamo-essay-repository.js";

const evaluateEssay = createEvaluateEssay({
  essayRepository: new DynamoEssayRepository(),
  essayEvaluationRepository: new DynamoEssayEvaluationRepository(),
  essayCostRepository: new DynamoEssayCostRepository(),
  essayEvaluationGateway: new GeminiEssayEvaluationGateway(),
  devAlertGateway: new SnsDevAlertGateway(),
  idGenerator: new KsuidIdGenerator(),
});

// Consumer of the fila de Avaliação (EssayEvaluationQueue). Batch size is 1, same reasoning as
// essaysValidate — one essay's failure can't block another's, and letting the error propagate is
// what makes the queue's own RedrivePolicy (maxReceiveCount: 3) retry and, on the last attempt,
// move it to the DLQ.
export const handler: SQSHandler = async (event) => {
  for (const record of event.Records) {
    const { essayId } = JSON.parse(record.body) as { essayId: string };
    await evaluateEssay({ essayId });
  }
};
