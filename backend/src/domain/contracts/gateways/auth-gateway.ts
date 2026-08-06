import { BadRequestError } from "../../../shared/errors/bad-request-error.js";
import { ConflictError } from "../../../shared/errors/conflict-error.js";
import { UnauthorizedError } from "../../../shared/errors/unauthorized-error.js";

export interface AuthTokens {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthSignUpInput {
  name: string;
  email: string;
  password: string;
}

export interface AuthLoginInput {
  email: string;
  password: string;
}

export interface AuthGateway {
  signUp(input: AuthSignUpInput): Promise<{ externalId: string }>;
  login(input: AuthLoginInput): Promise<AuthTokens>;
  deleteUser(input: { email: string }): Promise<void>;
}

export class EmailAlreadyExistsError extends ConflictError {
  constructor(email: string) {
    super(`Já existe uma conta com o e-mail "${email}"`);
  }
}

export class InvalidCredentialsError extends UnauthorizedError {
  constructor() {
    super("E-mail ou senha inválidos");
  }
}

export class WeakPasswordError extends BadRequestError {
  constructor(reason?: string) {
    super(reason ?? "A senha não atende aos requisitos de complexidade");
  }
}
