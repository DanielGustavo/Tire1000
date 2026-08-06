import type { createSignUpUser } from "../../use-cases/sign-up-user/sign-up-user.js";
import {
  Controller,
  type ControllerRequest,
  type ControllerResponse,
} from "../controller.js";
import { SignupSchema } from "./signup-schema.js";

type SignUpUser = ReturnType<typeof createSignUpUser>;

export class SignupController extends Controller {
  private readonly schema = new SignupSchema();

  constructor(private readonly signUpUser: SignUpUser) {
    super();
  }

  protected async handle({
    body,
  }: ControllerRequest): Promise<ControllerResponse> {
    const { name, email, password, creditsQty } = this.schema.parse(body);

    const result = await this.signUpUser({ name, email, password, creditsQty });
    return { statusCode: 201, body: result };
  }
}
