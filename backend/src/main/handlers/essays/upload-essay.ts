import { apigwAdapter } from "../../adapters/apigw-adapter.js";
import { UploadEssayController } from "../../../application/controllers/essays/upload-essay-controller.js";
import { createUploadEssay } from "../../../application/use-cases/upload-essay/upload-essay.js";
import { S3EssayStorageGateway } from "../../../infra/gateways/s3-essay-storage-gateway.js";
import { KsuidIdGenerator } from "../../../infra/gateways/ksuid-id-generator.js";
import { DynamoEssayRepository } from "../../../infra/repositories/dynamo-essay-repository.js";
import { DynamoThemeRepository } from "../../../infra/repositories/dynamo-theme-repository.js";
import { DynamoThemeTopicRepository } from "../../../infra/repositories/dynamo-theme-topic-repository.js";
import { DynamoUserRepository } from "../../../infra/repositories/dynamo-user-repository.js";

const uploadEssay = createUploadEssay({
  essayRepository: new DynamoEssayRepository(),
  userRepository: new DynamoUserRepository(),
  themeRepository: new DynamoThemeRepository(),
  themeTopicRepository: new DynamoThemeTopicRepository(),
  essayStorageGateway: new S3EssayStorageGateway(),
  idGenerator: new KsuidIdGenerator(),
});

export const handler = apigwAdapter(new UploadEssayController(uploadEssay));
