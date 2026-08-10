import type { createListUserEssays } from "../../use-cases/list-user-essays/list-user-essays.js";
import { UnauthorizedError } from "../../../shared/errors/unauthorized-error.js";
import { Controller, type ControllerRequest, type ControllerResponse } from "../controller.js";

type ListUserEssays = ReturnType<typeof createListUserEssays>;

export class ListUserEssaysController extends Controller {
  constructor(private readonly listUserEssays: ListUserEssays) {
    super();
  }

  protected async handle({ auth, queryStringParameters }: ControllerRequest): Promise<ControllerResponse> {
    if (!auth) throw new UnauthorizedError();

    const result = await this.listUserEssays({ userId: auth.id, cursor: queryStringParameters.cursor });

    return { statusCode: 200, body: result };
  }
}
