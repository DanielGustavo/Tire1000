import { describe, expect, it } from "vitest";
import { InvalidCredentialsError } from "../../gateways/auth-gateway.js";
import { InMemoryAuthGateway } from "../../gateways/fakes/in-memory-auth-gateway.js";
import { createLogin } from "./login.js";

async function buildAuthGatewayWithUser() {
  const authGateway = new InMemoryAuthGateway();
  await authGateway.signUp({ name: "Student", email: "student@example.com", password: "S3curePass!" });
  return authGateway;
}

describe("Login", () => {
  it("returns tokens for correct credentials", async () => {
    const authGateway = await buildAuthGatewayWithUser();
    const login = createLogin({ authGateway });

    const tokens = await login({ email: "student@example.com", password: "S3curePass!" });

    expect(tokens).toEqual({
      accessToken: "fake-access-token-fake-cognito-sub-1",
      idToken: "fake-id-token-fake-cognito-sub-1",
      refreshToken: "fake-refresh-token-fake-cognito-sub-1",
      expiresIn: 3600,
    });
  });

  it("throws InvalidCredentialsError for a wrong password", async () => {
    const authGateway = await buildAuthGatewayWithUser();
    const login = createLogin({ authGateway });

    await expect(login({ email: "student@example.com", password: "wrong-password" })).rejects.toThrow(
      InvalidCredentialsError,
    );
  });

  it("throws InvalidCredentialsError for an unknown email", async () => {
    const authGateway = await buildAuthGatewayWithUser();
    const login = createLogin({ authGateway });

    await expect(login({ email: "unknown@example.com", password: "S3curePass!" })).rejects.toThrow(
      InvalidCredentialsError,
    );
  });
});
