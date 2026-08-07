import type { createGetEssayDetail } from "../../use-cases/get-essay-detail/get-essay-detail.js";
import { BadRequestError } from "../../../shared/errors/bad-request-error.js";
import { UnauthorizedError } from "../../../shared/errors/unauthorized-error.js";
import { Controller, type ControllerRequest, type ControllerResponse } from "../controller.js";

type GetEssayDetail = ReturnType<typeof createGetEssayDetail>;

export class GetEssayDetailController extends Controller {
  constructor(private readonly getEssayDetail: GetEssayDetail) {
    super();
  }

  protected async handle({ pathParameters, auth }: ControllerRequest): Promise<ControllerResponse> {
    if (!auth) throw new UnauthorizedError();

    const { essayId } = pathParameters;
    if (!essayId) throw new BadRequestError("essayId é obrigatório");

    const result = await this.getEssayDetail({ userId: auth.id, essayId });

    return { statusCode: 200, body: result };
  }
}
