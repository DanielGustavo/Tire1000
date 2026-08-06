import type { createListTopics } from "../../use-cases/list-topics/list-topics.js";
import { Controller, type ControllerRequest, type ControllerResponse } from "../controller.js";

type ListTopics = ReturnType<typeof createListTopics>;

export class ListTopicsController extends Controller {
  constructor(private readonly listTopics: ListTopics) {
    super();
  }

  protected async handle(_request: ControllerRequest): Promise<ControllerResponse> {
    const topics = await this.listTopics();
    return { statusCode: 200, body: topics };
  }
}
