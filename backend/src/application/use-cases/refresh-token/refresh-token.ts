import type { AuthGateway } from "../../../domain/contracts/gateways/auth-gateway.js";
import { toAuthTokensDTO, type AuthTokensDTO } from "../../dtos/auth-tokens-dto.js";

export interface RefreshTokenDeps {
  authGateway: AuthGateway;
}

export interface RefreshTokenInput {
  refreshToken: string;
}

export function createRefreshToken({ authGateway }: RefreshTokenDeps) {
  return async function refreshToken({ refreshToken }: RefreshTokenInput): Promise<AuthTokensDTO> {
    const tokens = await authGateway.refresh({ refreshToken });
    return toAuthTokensDTO(tokens);
  };
}
