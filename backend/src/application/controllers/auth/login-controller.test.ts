import { describe, expect, it } from "vitest";
import { InvalidCredentialsError } from "../../../domain/contracts/gateways/auth-gateway.js";
import type { AuthTokens } from "../../../domain/contracts/gateways/auth-gateway.js";
import { HttpError } from "../http-error.js";
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

  it("throws a 400 HttpError when a required field is missing", async () => {
    const controller = new LoginController(async () => {
      throw new Error("should not be called");
    });

    await expect(controller.handle(buildRequest({ email: "student@example.com" }))).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("throws a 401 HttpError for invalid credentials", async () => {
    const controller = new LoginController(async () => {
      throw new InvalidCredentialsError();
    });

    await expect(
      controller.handle(buildRequest({ email: "student@example.com", password: "wrong" })),
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it("rejects with an HttpError instance", async () => {
    const controller = new LoginController(async () => {
      throw new InvalidCredentialsError();
    });

    await expect(
      controller.handle(buildRequest({ email: "student@example.com", password: "wrong" })),
    ).rejects.toBeInstanceOf(HttpError);
  });
});
