import type { createListThemes } from "../../use-cases/list-themes/list-themes.js";
import { Controller, type ControllerRequest, type ControllerResponse } from "../controller.js";

type ListThemes = ReturnType<typeof createListThemes>;

export class ListThemesController extends Controller {
  constructor(private readonly listThemes: ListThemes) {
    super();
  }

  protected async handle({ queryStringParameters }: ControllerRequest): Promise<ControllerResponse> {
    const themes = await this.listThemes({
      topicId: queryStringParameters.topicId,
      search: queryStringParameters.search,
    });

    return { statusCode: 200, body: themes };
  }
}
