import type { createSignUpUser } from "../../use-cases/sign-up-user/sign-up-user.js";
import { Controller, type ControllerRequest, type ControllerResponse } from "../controller.js";
import { HttpError } from "../http-error.js";

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

  protected async handle({ body }: ControllerRequest): Promise<ControllerResponse> {
    const { name, email, password } = (body ?? {}) as SignupRequestBody;

    if (!name || !email || !password) {
      throw new HttpError(400, "name, email and password are required");
    }

    const result = await this.signUpUser({ name, email, password });
    return { statusCode: 201, body: result };
  }
}
