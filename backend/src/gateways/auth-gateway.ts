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

export class EmailAlreadyExistsError extends Error {
  constructor(email: string) {
    super(`An account with email "${email}" already exists`);
    this.name = "EmailAlreadyExistsError";
  }
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super("Invalid email or password");
    this.name = "InvalidCredentialsError";
  }
}

export class WeakPasswordError extends Error {
  constructor(reason?: string) {
    super(reason ?? "Password does not meet the required complexity");
    this.name = "WeakPasswordError";
  }
}
