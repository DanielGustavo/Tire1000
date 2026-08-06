import type { createGetCurrentUser } from "../../use-cases/get-current-user/get-current-user.js";
import { NotFoundError } from "../../../shared/errors/not-found-error.js";
import { UnauthorizedError } from "../../../shared/errors/unauthorized-error.js";
import { Controller, type ControllerRequest, type ControllerResponse } from "../controller.js";

type GetCurrentUser = ReturnType<typeof createGetCurrentUser>;

export class GetCurrentUserController extends Controller {
  constructor(private readonly getCurrentUser: GetCurrentUser) {
    super();
  }

  protected async handle({ auth }: ControllerRequest): Promise<ControllerResponse> {
    if (!auth) throw new UnauthorizedError();

    const user = await this.getCurrentUser({ externalId: auth.externalId });
    if (!user) throw new NotFoundError("Usuário não encontrado");

    return { statusCode: 200, body: user };
  }
}
