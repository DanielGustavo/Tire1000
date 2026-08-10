import { describe, expect, it } from "vitest";
import type { ListUserEssaysOutput } from "../../use-cases/list-user-essays/list-user-essays.js";
import type { ControllerAuth } from "../controller.js";
import { ListUserEssaysController } from "./list-user-essays-controller.js";

function buildRequest(auth: ControllerAuth | null = { id: "user-1" }) {
  return { body: {}, headers: {}, pathParameters: {}, queryStringParameters: {}, auth };
}

const FAKE_OUTPUT: ListUserEssaysOutput = {
  essays: [
    {
      id: "essay-1",
      status: "SUCCESS",
      rejectionReasons: [],
      themeId: "theme-1",
      themeTitle: "Educação financeira",
      topicColor: "#2E7D32",
      enemYear: 2023,
      topicTitle: "Educação",
      finalScore: 800,
      createdAt: "2026-08-01T00:00:00.000Z",
    },
  ],
};

describe("ListUserEssaysController", () => {
  it("returns 200 with the use case's result on success", async () => {
    const controller = new ListUserEssaysController(async () => FAKE_OUTPUT);

    const response = await controller.execute(buildRequest());

    expect(response).toEqual({ statusCode: 200, body: FAKE_OUTPUT });
  });

  it("passes the authenticated user's id to the use case", async () => {
    let receivedInput: unknown;
    const controller = new ListUserEssaysController(async (input) => {
      receivedInput = input;
      return FAKE_OUTPUT;
    });

    await controller.execute(buildRequest({ id: "user-1" }));

    expect(receivedInput).toEqual({ userId: "user-1", cursor: undefined });
  });

  it("passes the cursor query param through to the use case", async () => {
    let receivedInput: unknown;
    const controller = new ListUserEssaysController(async (input) => {
      receivedInput = input;
      return FAKE_OUTPUT;
    });

    await controller.execute({ ...buildRequest(), queryStringParameters: { cursor: "abc123" } });

    expect(receivedInput).toEqual({ userId: "user-1", cursor: "abc123" });
  });

  it("throws a 401 HttpError when there is no authenticated user", async () => {
    const controller = new ListUserEssaysController(async () => {
      throw new Error("should not be called");
    });

    await expect(controller.execute(buildRequest(null))).rejects.toMatchObject({ statusCode: 401 });
  });
});
