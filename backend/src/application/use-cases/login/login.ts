import type { AuthGateway } from "../../../domain/contracts/gateways/auth-gateway.js";
import { toAuthTokensDTO, type AuthTokensDTO } from "../../dtos/auth-tokens-dto.js";

export interface LoginDeps {
  authGateway: AuthGateway;
}

export interface LoginInput {
  email: string;
  password: string;
}

export function createLogin({ authGateway }: LoginDeps) {
  return async function login({ email, password }: LoginInput): Promise<AuthTokensDTO> {
    const tokens = await authGateway.login({ email, password });
    return toAuthTokensDTO(tokens);
  };
}
