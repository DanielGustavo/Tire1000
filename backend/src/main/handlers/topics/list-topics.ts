import { apigwAdapter } from "../../adapters/apigw-adapter.js";
import { ListTopicsController } from "../../../application/controllers/topics/list-topics-controller.js";
import { DynamoThemeTopicRepository } from "../../../infra/repositories/dynamo-theme-topic-repository.js";
import { createListTopics } from "../../../application/use-cases/list-topics/list-topics.js";

const listTopics = createListTopics({ themeTopicRepository: new DynamoThemeTopicRepository() });

export const handler = apigwAdapter(new ListTopicsController(listTopics));
