import { describe, expect, it } from "vitest";
import { InvalidRefreshTokenError } from "../../../domain/contracts/gateways/auth-gateway.js";
import { InMemoryAuthGateway } from "../../../infra/gateways/fakes/in-memory-auth-gateway.js";
import { createRefreshToken } from "./refresh-token.js";

async function buildAuthGatewayWithUser() {
  const authGateway = new InMemoryAuthGateway();
  await authGateway.signUp({ id: "user-1", name: "Student", email: "student@example.com", password: "S3curePass!" });
  return authGateway;
}

describe("RefreshToken", () => {
  it("returns new tokens for a valid refresh token, keeping the same refreshToken", async () => {
    const authGateway = await buildAuthGatewayWithUser();
    const refreshToken = createRefreshToken({ authGateway });

    const tokens = await refreshToken({ refreshToken: "fake-refresh-token-fake-cognito-sub-1" });

    expect(tokens).toEqual({
      accessToken: "fake-access-token-fake-cognito-sub-1",
      refreshToken: "fake-refresh-token-fake-cognito-sub-1",
      expiresIn: 3600,
    });
  });

  it("throws InvalidRefreshTokenError for an unknown refresh token", async () => {
    const authGateway = await buildAuthGatewayWithUser();
    const refreshToken = createRefreshToken({ authGateway });

    await expect(refreshToken({ refreshToken: "not-a-real-token" })).rejects.toThrow(InvalidRefreshTokenError);
  });
});
