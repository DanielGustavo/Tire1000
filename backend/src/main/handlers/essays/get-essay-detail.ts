import { apigwAdapter } from "../../adapters/apigw-adapter.js";
import { GetEssayDetailController } from "../../../application/controllers/essays/get-essay-detail-controller.js";
import { createGetEssayDetail } from "../../../application/use-cases/get-essay-detail/get-essay-detail.js";
import { DynamoEssayRepository } from "../../../infra/repositories/dynamo-essay-repository.js";

const getEssayDetail = createGetEssayDetail({
  essayRepository: new DynamoEssayRepository(),
});

export const handler = apigwAdapter(new GetEssayDetailController(getEssayDetail));
