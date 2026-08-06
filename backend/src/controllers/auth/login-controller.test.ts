import { describe, expect, it } from "vitest";
import { InvalidCredentialsError } from "../../contracts/auth-gateway.js";
import type { AuthTokens } from "../../contracts/auth-gateway.js";
import { LoginController } from "./login-controller.js";

function buildRequest(body: unknown) {
  return { body, headers: {}, pathParameters: {}, queryStringParameters: {} };
}

describe("LoginController", () => {
  it("returns 200 with the tokens on success", async () => {
    const tokens: AuthTokens = { accessToken: "a", idToken: "i", refreshToken: "r", expiresIn: 3600 };
    const controller = new LoginController(async () => tokens);

    const response = await controller.handle(buildRequest({ email: "student@example.com", password: "S3curePass!" }));

    expect(response).toEqual({ statusCode: 200, body: tokens });
  });

  it("returns 400 when a required field is missing", async () => {
    const controller = new LoginController(async () => {
      throw new Error("should not be called");
    });

    const response = await controller.handle(buildRequest({ email: "student@example.com" }));

    expect(response.statusCode).toBe(400);
  });

  it("returns 401 for invalid credentials", async () => {
    const controller = new LoginController(async () => {
      throw new InvalidCredentialsError();
    });

    const response = await controller.handle(buildRequest({ email: "student@example.com", password: "wrong" }));

    expect(response.statusCode).toBe(401);
  });
});
