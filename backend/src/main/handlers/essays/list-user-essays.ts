import { apigwAdapter } from "../../adapters/apigw-adapter.js";
import { ListUserEssaysController } from "../../../application/controllers/essays/list-user-essays-controller.js";
import { createListUserEssays } from "../../../application/use-cases/list-user-essays/list-user-essays.js";
import { DynamoEssayRepository } from "../../../infra/repositories/dynamo-essay-repository.js";

const listUserEssays = createListUserEssays({
  essayRepository: new DynamoEssayRepository(),
});

export const handler = apigwAdapter(new ListUserEssaysController(listUserEssays));
