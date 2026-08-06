import { describe, expect, it } from "vitest";
import { InMemoryUserRepository } from "../../../infra/repositories/fakes/in-memory-user-repository.js";
import type { User } from "../../../domain/entities/user.js";
import { createGetUserById } from "./get-user-by-id.js";

function buildUser(overrides: Partial<User> = {}): User {
  return {
    id: "user-1",
    type: "USER",
    externalId: "cognito-sub-1",
    email: "student@example.com",
    name: "Student",
    credits: 3,
    createdAt: "2026-08-05T00:00:00.000Z",
    updatedAt: "2026-08-05T00:00:00.000Z",
    ...overrides,
  };
}

describe("GetUserById", () => {
  it("returns the user when it exists in the repository", async () => {
    const userRepository = new InMemoryUserRepository();
    await userRepository.create(buildUser());
    const getUserById = createGetUserById({ userRepository });

    const result = await getUserById({ userId: "user-1" });

    expect(result).toEqual(buildUser());
  });

  it("returns null when no user matches the id", async () => {
    const userRepository = new InMemoryUserRepository();
    const getUserById = createGetUserById({ userRepository });

    const result = await getUserById({ userId: "missing-user" });

    expect(result).toBeNull();
  });
});
