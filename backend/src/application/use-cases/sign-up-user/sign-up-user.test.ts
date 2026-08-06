import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EmailAlreadyExistsError } from "../../../domain/contracts/gateways/auth-gateway.js";
import type { UserRepository } from "../../../domain/contracts/repositories/user-repository.js";
import { InMemoryAuthGateway } from "../../../infra/gateways/fakes/in-memory-auth-gateway.js";
import { SequentialIdGenerator } from "../../../infra/gateways/fakes/sequential-id-generator.js";
import { InMemoryUserRepository } from "../../../infra/repositories/fakes/in-memory-user-repository.js";
import { createSignUpUser } from "./sign-up-user.js";

function buildDeps() {
  return {
    authGateway: new InMemoryAuthGateway(),
    userRepository: new InMemoryUserRepository(),
    idGenerator: new SequentialIdGenerator(),
  };
}

describe("SignUpUser", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-05T00:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("creates the account in Cognito and the User record with 0 credits", async () => {
    const deps = buildDeps();
    const signUpUser = createSignUpUser(deps);

    const result = await signUpUser({ name: "Student", email: "student@example.com", password: "S3curePass!" });

    expect(result.user).toEqual({
      id: "fake-id-1",
      type: "USER",
      externalId: "fake-cognito-sub-1",
      email: "student@example.com",
      name: "Student",
      credits: 0,
      createdAt: "2026-08-05T00:00:00.000Z",
      updatedAt: "2026-08-05T00:00:00.000Z",
    });
    await expect(deps.userRepository.findByEmail("student@example.com")).resolves.toEqual(result.user);
  });

  it("returns tokens for the newly created account", async () => {
    const deps = buildDeps();
    const signUpUser = createSignUpUser(deps);

    const result = await signUpUser({ name: "Student", email: "student@example.com", password: "S3curePass!" });

    expect(result.tokens).toEqual({
      accessToken: "fake-access-token-fake-cognito-sub-1",
      idToken: "fake-id-token-fake-cognito-sub-1",
      refreshToken: "fake-refresh-token-fake-cognito-sub-1",
      expiresIn: 3600,
    });
  });

  it("propagates EmailAlreadyExistsError and does not create a User record when the email is already registered", async () => {
    const deps = buildDeps();
    const signUpUser = createSignUpUser(deps);
    await signUpUser({ name: "Student", email: "student@example.com", password: "S3curePass!" });

    await expect(
      signUpUser({ name: "Other Student", email: "student@example.com", password: "AnotherPass1!" }),
    ).rejects.toThrow(EmailAlreadyExistsError);

    const user = await deps.userRepository.findByEmail("student@example.com");
    expect(user?.name).toBe("Student");
  });

  it("rolls back the Cognito account when the User record fails to save", async () => {
    const deps = buildDeps();
    const failingUserRepository: UserRepository = {
      findById: async () => null,
      findByEmail: async () => null,
      create: async () => {
        throw new Error("DynamoDB unavailable");
      },
    };
    const signUpUser = createSignUpUser({ ...deps, userRepository: failingUserRepository });

    await expect(
      signUpUser({ name: "Student", email: "student@example.com", password: "S3curePass!" }),
    ).rejects.toThrow("DynamoDB unavailable");

    await expect(
      deps.authGateway.signUp({ name: "Student", email: "student@example.com", password: "S3curePass!" }),
    ).resolves.toEqual({ externalId: "fake-cognito-sub-2" });
  });
});
