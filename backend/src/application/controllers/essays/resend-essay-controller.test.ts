import { describe, expect, it } from "vitest";
import { ConflictError } from "../../../shared/errors/conflict-error.js";
import { NotFoundError } from "../../../shared/errors/not-found-error.js";
import type { ControllerAuth } from "../controller.js";
import { ResendEssayController } from "./resend-essay-controller.js";

function buildRequest(pathParameters: Record<string, string | undefined>, auth: ControllerAuth | null = { id: "user-1" }) {
  return { body: {}, headers: {}, pathParameters, queryStringParameters: {}, auth };
}

const FAKE_OUTPUT = { essayId: "essay-1", upload: { url: "https://s3.test/essays/essay-1", fields: { key: "essays/essay-1" } } };

describe("ResendEssayController", () => {
  it("returns 200 with the essayId and presigned upload from the use case", async () => {
    const controller = new ResendEssayController(async () => FAKE_OUTPUT);

    const response = await controller.execute(buildRequest({ essayId: "essay-1" }));

    expect(response).toEqual({ statusCode: 200, body: FAKE_OUTPUT });
  });

  it("passes the authenticated user's id and the essayId path parameter to the use case", async () => {
    let receivedInput: unknown;
    const controller = new ResendEssayController(async (input) => {
      receivedInput = input;
      return FAKE_OUTPUT;
    });

    await controller.execute(buildRequest({ essayId: "essay-1" }, { id: "user-1" }));

    expect(receivedInput).toEqual({ userId: "user-1", essayId: "essay-1" });
  });

  it("throws a 401 HttpError when there is no authenticated user", async () => {
    const controller = new ResendEssayController(async () => {
      throw new Error("should not be called");
    });

    await expect(controller.execute(buildRequest({ essayId: "essay-1" }, null))).rejects.toMatchObject({ statusCode: 401 });
  });

  it("throws a 400 HttpError when essayId is missing from the path", async () => {
    const controller = new ResendEssayController(async () => {
      throw new Error("should not be called");
    });

    await expect(controller.execute(buildRequest({}))).rejects.toMatchObject({ statusCode: 400 });
  });

  it("throws a 404 HttpError when the use case cannot find the essay", async () => {
    const controller = new ResendEssayController(async () => {
      throw new NotFoundError("Redação não encontrada");
    });

    await expect(controller.execute(buildRequest({ essayId: "essay-1" }))).rejects.toMatchObject({ statusCode: 404 });
  });

  it("throws a 409 HttpError when the use case reports the essay isn't resendable", async () => {
    const controller = new ResendEssayController(async () => {
      throw new ConflictError("Só é possível reenviar uma redação que esteja aguardando envio ou tenha sido rejeitada");
    });

    await expect(controller.execute(buildRequest({ essayId: "essay-1" }))).rejects.toMatchObject({ statusCode: 409 });
  });
});
