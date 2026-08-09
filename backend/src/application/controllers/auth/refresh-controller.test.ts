import { describe, expect, it } from "vitest";
import { InvalidRefreshTokenError } from "../../../domain/contracts/gateways/auth-gateway.js";
import type { AuthTokensDTO } from "../../dtos/auth-tokens-dto.js";
import { HttpError } from "../http-error.js";
import { RefreshController } from "./refresh-controller.js";

function buildRequest(body: unknown) {
  return { body, headers: {}, pathParameters: {}, queryStringParameters: {}, auth: null };
}

describe("RefreshController", () => {
  it("returns 200 with the new tokens on success", async () => {
    const tokens: AuthTokensDTO = { accessToken: "a", refreshToken: "r", expiresIn: 3600 };
    const controller = new RefreshController(async () => tokens);

    const response = await controller.execute(buildRequest({ refreshToken: "r" }));

    expect(response).toEqual({ statusCode: 200, body: tokens });
  });

  it("throws a 400 HttpError when refreshToken is missing", async () => {
    const controller = new RefreshController(async () => {
      throw new Error("should not be called");
    });

    await expect(controller.execute(buildRequest({}))).rejects.toMatchObject({ statusCode: 400 });
  });

  it("throws a 401 HttpError for an invalid refresh token", async () => {
    const controller = new RefreshController(async () => {
      throw new InvalidRefreshTokenError();
    });

    await expect(controller.execute(buildRequest({ refreshToken: "expired" }))).rejects.toMatchObject({
      statusCode: 401,
    });
  });

  it("rejects with an HttpError instance", async () => {
    const controller = new RefreshController(async () => {
      throw new InvalidRefreshTokenError();
    });

    await expect(controller.execute(buildRequest({ refreshToken: "expired" }))).rejects.toBeInstanceOf(HttpError);
  });
});
