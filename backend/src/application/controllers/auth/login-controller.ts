import { InvalidCredentialsError } from "../../../domain/contracts/gateways/auth-gateway.js";
import type { createLogin } from "../../use-cases/login/login.js";
import { Controller, type ControllerRequest, type ControllerResponse } from "../controller.js";

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
      return { statusCode: 400, body: { message: "email and password are required" } };
    }

    try {
      const tokens = await this.login({ email, password });
      return { statusCode: 200, body: tokens };
    } catch (error) {
      if (error instanceof InvalidCredentialsError) {
        return { statusCode: 401, body: { message: error.message } };
      }
      throw error;
    }
  }
}
