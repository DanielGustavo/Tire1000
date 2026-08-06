import type { createGetTheme } from "../../use-cases/get-theme/get-theme.js";
import { BadRequestError } from "../../../shared/errors/bad-request-error.js";
import { Controller, type ControllerRequest, type ControllerResponse } from "../controller.js";

type GetTheme = ReturnType<typeof createGetTheme>;

export class GetThemeController extends Controller {
  constructor(private readonly getTheme: GetTheme) {
    super();
  }

  protected async handle({ pathParameters }: ControllerRequest): Promise<ControllerResponse> {
    const { themeId } = pathParameters;
    if (!themeId) throw new BadRequestError("themeId é obrigatório");

    const result = await this.getTheme({ themeId });
    return { statusCode: 200, body: result };
  }
}
