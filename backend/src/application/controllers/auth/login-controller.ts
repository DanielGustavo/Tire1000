import type { createLogin } from "../../use-cases/login/login.js";
import { Controller, type ControllerRequest, type ControllerResponse } from "../controller.js";
import { LoginSchema } from "./login-schema.js";

type Login = ReturnType<typeof createLogin>;

export class LoginController extends Controller {
  private readonly schema = new LoginSchema();

  constructor(private readonly login: Login) {
    super();
  }

  protected async handle({ body }: ControllerRequest): Promise<ControllerResponse> {
    const { email, password } = this.schema.parse(body);

    const tokens = await this.login({ email, password });
    return { statusCode: 200, body: tokens };
  }
}
