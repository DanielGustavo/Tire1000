import { describe, expect, it } from "vitest";
import { EmailAlreadyExistsError, WeakPasswordError } from "../../../domain/contracts/gateways/auth-gateway.js";
import type { SignUpUserOutput } from "../../use-cases/sign-up-user/sign-up-user.js";
import { SignupController } from "./signup-controller.js";

function buildRequest(body: unknown) {
  return { body, headers: {}, pathParameters: {}, queryStringParameters: {} };
}

describe("SignupController", () => {
  it("returns 201 with the use case's result on success", async () => {
    const result: SignUpUserOutput = {
      user: {
        id: "user-1",
        type: "USER",
        externalId: "cognito-sub-1",
        email: "student@example.com",
        name: "Student",
        credits: 0,
        createdAt: "2026-08-05T00:00:00.000Z",
        updatedAt: "2026-08-05T00:00:00.000Z",
      },
      tokens: { accessToken: "a", idToken: "i", refreshToken: "r", expiresIn: 3600 },
    };
    const controller = new SignupController(async () => result);

    const response = await controller.handle(
      buildRequest({ name: "Student", email: "student@example.com", password: "S3curePass!" }),
    );

    expect(response).toEqual({ statusCode: 201, body: result });
  });

  it("returns 400 when a required field is missing", async () => {
    const controller = new SignupController(async () => {
      throw new Error("should not be called");
    });

    const response = await controller.handle(buildRequest({ email: "student@example.com", password: "x" }));

    expect(response.statusCode).toBe(400);
  });

  it("returns 409 when the email is already registered", async () => {
    const controller = new SignupController(async () => {
      throw new EmailAlreadyExistsError("student@example.com");
    });

    const response = await controller.handle(
      buildRequest({ name: "Student", email: "student@example.com", password: "S3curePass!" }),
    );

    expect(response.statusCode).toBe(409);
  });

  it("returns 400 when the password is rejected as weak", async () => {
    const controller = new SignupController(async () => {
      throw new WeakPasswordError();
    });

    const response = await controller.handle(
      buildRequest({ name: "Student", email: "student@example.com", password: "weak" }),
    );

    expect(response.statusCode).toBe(400);
  });
});
