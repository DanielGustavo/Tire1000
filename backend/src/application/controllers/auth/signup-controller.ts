import { EmailAlreadyExistsError, WeakPasswordError } from "../../../domain/contracts/gateways/auth-gateway.js";
import type { createSignUpUser } from "../../use-cases/sign-up-user/sign-up-user.js";
import { Controller, type ControllerRequest, type ControllerResponse } from "../controller.js";

type SignUpUser = ReturnType<typeof createSignUpUser>;

interface SignupRequestBody {
  name?: string;
  email?: string;
  password?: string;
}

export class SignupController extends Controller {
  constructor(private readonly signUpUser: SignUpUser) {
    super();
  }

  async handle({ body }: ControllerRequest): Promise<ControllerResponse> {
    const { name, email, password } = (body ?? {}) as SignupRequestBody;

    if (!name || !email || !password) {
      return { statusCode: 400, body: { message: "name, email and password are required" } };
    }

    try {
      const result = await this.signUpUser({ name, email, password });
      return { statusCode: 201, body: result };
    } catch (error) {
      if (error instanceof EmailAlreadyExistsError) {
        return { statusCode: 409, body: { message: error.message } };
      }
      if (error instanceof WeakPasswordError) {
        return { statusCode: 400, body: { message: error.message } };
      }
      throw error;
    }
  }
}
