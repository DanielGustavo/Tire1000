import type { createResendEssay } from "../../use-cases/resend-essay/resend-essay.js";
import { BadRequestError } from "../../../shared/errors/bad-request-error.js";
import { UnauthorizedError } from "../../../shared/errors/unauthorized-error.js";
import { Controller, type ControllerRequest, type ControllerResponse } from "../controller.js";

type ResendEssay = ReturnType<typeof createResendEssay>;

export class ResendEssayController extends Controller {
  constructor(private readonly resendEssay: ResendEssay) {
    super();
  }

  protected async handle({ pathParameters, auth }: ControllerRequest): Promise<ControllerResponse> {
    if (!auth) throw new UnauthorizedError();

    const { essayId } = pathParameters;
    if (!essayId) throw new BadRequestError("essayId é obrigatório");

    const result = await this.resendEssay({ userId: auth.id, essayId });

    return { statusCode: 200, body: result };
  }
}
