import { describe, expect, it } from "vitest";
import { User } from "../../../domain/entities/user.js";
import { InMemoryUserRepository } from "../../../infra/repositories/fakes/in-memory-user-repository.js";
import { createGetCurrentUser } from "./get-current-user.js";

describe("GetCurrentUser", () => {
  it("resolves the User matching the authenticated Cognito sub", async () => {
    const userRepository = new InMemoryUserRepository();
    await userRepository.create(
      User.create({ id: "user-1", externalId: "sub-1", email: "student@example.com", name: "Student" }),
    );
    const getCurrentUser = createGetCurrentUser({ userRepository });

    const result = await getCurrentUser({ externalId: "sub-1" });

    expect(result).toEqual({ id: "user-1", email: "student@example.com", name: "Student", credits: 0 });
  });

  it("returns null when no User matches the externalId", async () => {
    const getCurrentUser = createGetCurrentUser({ userRepository: new InMemoryUserRepository() });

    await expect(getCurrentUser({ externalId: "missing-sub" })).resolves.toBeNull();
  });
});
