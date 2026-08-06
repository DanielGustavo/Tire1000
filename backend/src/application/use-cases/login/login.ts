import type { AuthGateway, AuthTokens } from "../../../domain/contracts/gateways/auth-gateway.js";

export interface LoginDeps {
  authGateway: AuthGateway;
}

export interface LoginInput {
  email: string;
  password: string;
}

export function createLogin({ authGateway }: LoginDeps) {
  return async function login({ email, password }: LoginInput): Promise<AuthTokens> {
    return authGateway.login({ email, password });
  };
}
