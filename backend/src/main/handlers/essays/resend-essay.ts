import { apigwAdapter } from "../../adapters/apigw-adapter.js";
import { ResendEssayController } from "../../../application/controllers/essays/resend-essay-controller.js";
import { createResendEssay } from "../../../application/use-cases/resend-essay/resend-essay.js";
import { S3EssayStorageGateway } from "../../../infra/gateways/s3-essay-storage-gateway.js";
import { DynamoEssayRepository } from "../../../infra/repositories/dynamo-essay-repository.js";
import { DynamoUserRepository } from "../../../infra/repositories/dynamo-user-repository.js";

const resendEssay = createResendEssay({
  essayRepository: new DynamoEssayRepository(),
  userRepository: new DynamoUserRepository(),
  essayStorageGateway: new S3EssayStorageGateway(),
});

export const handler = apigwAdapter(new ResendEssayController(resendEssay));
