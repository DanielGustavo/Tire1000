import { describe, expect, it } from "vitest";
import type { UserDTO } from "../../dtos/user-dto.js";
import type { ControllerAuth } from "../controller.js";
import { GetCurrentUserController } from "./get-current-user-controller.js";

function buildRequest(auth: ControllerAuth | null = { externalId: "sub-1" }) {
  return { body: {}, headers: {}, pathParameters: {}, queryStringParameters: {}, auth };
}

describe("GetCurrentUserController", () => {
  it("returns 200 with the authenticated user's data", async () => {
    const user: UserDTO = { id: "user-1", email: "student@example.com", name: "Student", credits: 5 };
    const controller = new GetCurrentUserController(async () => user);

    const response = await controller.execute(buildRequest());

    expect(response).toEqual({ statusCode: 200, body: user });
  });

  it("throws a 401 HttpError when there is no authenticated user", async () => {
    const controller = new GetCurrentUserController(async () => {
      throw new Error("should not be called");
    });

    await expect(controller.execute(buildRequest(null))).rejects.toMatchObject({ statusCode: 401 });
  });

  it("throws a 404 HttpError when no User record matches the authenticated externalId", async () => {
    const controller = new GetCurrentUserController(async () => null);

    await expect(controller.execute(buildRequest())).rejects.toMatchObject({ statusCode: 404 });
  });
});
