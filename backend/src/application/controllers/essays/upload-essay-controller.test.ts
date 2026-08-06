import { describe, expect, it } from "vitest";
import { InsufficientCreditsError } from "../../../shared/errors/insufficient-credits-error.js";
import { NotFoundError } from "../../../shared/errors/not-found-error.js";
import type { ControllerAuth } from "../controller.js";
import { UploadEssayController } from "./upload-essay-controller.js";

function buildRequest(body: unknown, auth: ControllerAuth | null = { id: "user-1" }) {
  return { body, headers: {}, pathParameters: {}, queryStringParameters: {}, auth };
}

const FAKE_OUTPUT = { essayId: "essay-1", upload: { url: "https://s3.test/essays/essay-1", fields: { key: "essays/essay-1" } } };

describe("UploadEssayController", () => {
  it("returns 201 with the essayId and presigned upload from the use case", async () => {
    const controller = new UploadEssayController(async () => FAKE_OUTPUT);

    const response = await controller.execute(buildRequest({ themeId: "theme-1" }));

    expect(response).toEqual({ statusCode: 201, body: FAKE_OUTPUT });
  });

  it("passes the authenticated user's id and the requested themeId to the use case", async () => {
    let receivedInput: unknown;
    const controller = new UploadEssayController(async (input) => {
      receivedInput = input;
      return FAKE_OUTPUT;
    });

    await controller.execute(buildRequest({ themeId: "theme-1" }, { id: "user-1" }));

    expect(receivedInput).toEqual({ userId: "user-1", themeId: "theme-1" });
  });

  it("throws a 401 HttpError when there is no authenticated user", async () => {
    const controller = new UploadEssayController(async () => {
      throw new Error("should not be called");
    });

    await expect(controller.execute(buildRequest({ themeId: "theme-1" }, null))).rejects.toMatchObject({ statusCode: 401 });
  });

  it("throws a 400 HttpError when themeId is missing", async () => {
    const controller = new UploadEssayController(async () => {
      throw new Error("should not be called");
    });

    await expect(controller.execute(buildRequest({}))).rejects.toMatchObject({ statusCode: 400 });
  });

  it("throws a 400 HttpError when the use case reports insufficient credits", async () => {
    const controller = new UploadEssayController(async () => {
      throw new InsufficientCreditsError();
    });

    await expect(controller.execute(buildRequest({ themeId: "theme-1" }))).rejects.toMatchObject({ statusCode: 400 });
  });

  it("throws a 404 HttpError when the use case cannot resolve the theme", async () => {
    const controller = new UploadEssayController(async () => {
      throw new NotFoundError("Tema não encontrado");
    });

    await expect(controller.execute(buildRequest({ themeId: "theme-1" }))).rejects.toMatchObject({ statusCode: 404 });
  });
});
