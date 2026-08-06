import type { AuthTokens } from "../../domain/contracts/gateways/auth-gateway.js";

export interface AuthTokensDTO {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export function toAuthTokensDTO(tokens: AuthTokens): AuthTokensDTO {
  return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, expiresIn: tokens.expiresIn };
}
