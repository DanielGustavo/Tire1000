import type { createRefreshToken } from "../../use-cases/refresh-token/refresh-token.js";
import { Controller, type ControllerRequest, type ControllerResponse } from "../controller.js";
import { RefreshSchema } from "./refresh-schema.js";

type RefreshToken = ReturnType<typeof createRefreshToken>;

export class RefreshController extends Controller {
  private readonly schema = new RefreshSchema();

  constructor(private readonly refreshToken: RefreshToken) {
    super();
  }

  protected async handle({ body }: ControllerRequest): Promise<ControllerResponse> {
    const { refreshToken } = this.schema.parse(body);

    const tokens = await this.refreshToken({ refreshToken });
    return { statusCode: 200, body: tokens };
  }
}
