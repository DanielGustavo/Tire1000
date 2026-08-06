import { describe, expect, it } from "vitest";
import { NotFoundError } from "../../../shared/errors/not-found-error.js";
import type { GetThemeOutput } from "../../use-cases/get-theme/get-theme.js";
import { GetThemeController } from "./get-theme-controller.js";

function buildRequest(pathParameters: Record<string, string | undefined> = {}) {
  return { body: {}, headers: {}, pathParameters, queryStringParameters: {}, auth: null };
}

describe("GetThemeController", () => {
  it("returns 200 with the use case's result on success", async () => {
    const result: GetThemeOutput = {
      theme: { id: "theme-1", title: "Educação financeira", enemYear: 2023, topicId: "topic-1" },
      referenceTexts: [],
      topic: { id: "topic-1", title: "Educação", color: "#2E7D32" },
    };
    const controller = new GetThemeController(async () => result);

    const response = await controller.execute(buildRequest({ themeId: "theme-1" }));

    expect(response).toEqual({ statusCode: 200, body: result });
  });

  it("throws a 400 HttpError when themeId is missing from the path", async () => {
    const controller = new GetThemeController(async () => {
      throw new Error("should not be called");
    });

    await expect(controller.execute(buildRequest())).rejects.toMatchObject({ statusCode: 400 });
  });

  it("throws a 404 HttpError when the theme does not exist", async () => {
    const controller = new GetThemeController(async () => {
      throw new NotFoundError("Tema não encontrado");
    });

    await expect(controller.execute(buildRequest({ themeId: "missing-theme" }))).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});
