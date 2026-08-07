import { describe, expect, it } from "vitest";
import { NotFoundError } from "../../../shared/errors/not-found-error.js";
import type { GetEssayDetailOutput } from "../../use-cases/get-essay-detail/get-essay-detail.js";
import type { ControllerAuth } from "../controller.js";
import { GetEssayDetailController } from "./get-essay-detail-controller.js";

function buildRequest(pathParameters: Record<string, string | undefined>, auth: ControllerAuth | null = { id: "user-1" }) {
  return { body: {}, headers: {}, pathParameters, queryStringParameters: {}, auth };
}

const FAKE_OUTPUT: GetEssayDetailOutput = {
  essay: {
    id: "essay-1",
    status: "REJECTED",
    rejectionReasons: ["LOW_LIGHTING"],
    themeId: "theme-1",
    themeTitle: "Educação financeira",
    topicColor: "#2E7D32",
    createdAt: "2026-08-01T00:00:00.000Z",
    textContent: null,
    evaluation: null,
  },
};

describe("GetEssayDetailController", () => {
  it("returns 200 with the use case's result on success", async () => {
    const controller = new GetEssayDetailController(async () => FAKE_OUTPUT);

    const response = await controller.execute(buildRequest({ essayId: "essay-1" }));

    expect(response).toEqual({ statusCode: 200, body: FAKE_OUTPUT });
  });

  it("passes the authenticated user's id and the essayId path parameter to the use case", async () => {
    let receivedInput: unknown;
    const controller = new GetEssayDetailController(async (input) => {
      receivedInput = input;
      return FAKE_OUTPUT;
    });

    await controller.execute(buildRequest({ essayId: "essay-1" }, { id: "user-1" }));

    expect(receivedInput).toEqual({ userId: "user-1", essayId: "essay-1" });
  });

  it("throws a 401 HttpError when there is no authenticated user", async () => {
    const controller = new GetEssayDetailController(async () => {
      throw new Error("should not be called");
    });

    await expect(controller.execute(buildRequest({ essayId: "essay-1" }, null))).rejects.toMatchObject({ statusCode: 401 });
  });

  it("throws a 400 HttpError when essayId is missing from the path", async () => {
    const controller = new GetEssayDetailController(async () => {
      throw new Error("should not be called");
    });

    await expect(controller.execute(buildRequest({}))).rejects.toMatchObject({ statusCode: 400 });
  });

  it("throws a 404 HttpError when the use case cannot find the essay", async () => {
    const controller = new GetEssayDetailController(async () => {
      throw new NotFoundError("Redação não encontrada");
    });

    await expect(controller.execute(buildRequest({ essayId: "essay-1" }))).rejects.toMatchObject({ statusCode: 404 });
  });
});
