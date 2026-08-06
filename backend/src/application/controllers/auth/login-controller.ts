import { InvalidCredentialsError } from "../../../domain/contracts/gateways/auth-gateway.js";
import type { createLogin } from "../../use-cases/login/login.js";
import { Controller, type ControllerRequest, type ControllerResponse } from "../controller.js";
import { HttpError } from "../http-error.js";

type Login = ReturnType<typeof createLogin>;

interface LoginRequestBody {
  email?: string;
  password?: string;
}

export class LoginController extends Controller {
  constructor(private readonly login: Login) {
    super();
  }

  async handle({ body }: ControllerRequest): Promise<ControllerResponse> {
    const { email, password } = (body ?? {}) as LoginRequestBody;

    if (!email || !password) {
      throw new HttpError(400, "email and password are required");
    }

    try {
      const tokens = await this.login({ email, password });
      return { statusCode: 200, body: tokens };
    } catch (error) {
      if (error instanceof InvalidCredentialsError) {
        throw new HttpError(401, error.message);
      }
      throw error;
    }
  }
}
