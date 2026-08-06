import type { APIGatewayProxyEventV2, Context } from "aws-lambda";
import { describe, expect, it } from "vitest";
import type { Controller, ControllerRequest, ControllerResponse } from "../../application/controllers/controller.js";
import { HttpError } from "../../application/controllers/http-error.js";
import { apigwAdapter } from "./apigw-adapter.js";

function buildEvent(body?: unknown): APIGatewayProxyEventV2 {
  return {
    body: body === undefined ? undefined : JSON.stringify(body),
    headers: {},
    pathParameters: {},
    queryStringParameters: {},
  } as APIGatewayProxyEventV2;
}

function stubController(handle: (request: ControllerRequest) => Promise<ControllerResponse>): Controller {
  return { handle };
}

describe("apigwAdapter", () => {
  it("returns the controller's response on success", async () => {
    const controller = stubController(async () => ({ statusCode: 200, body: { ok: true } }));
    const handler = apigwAdapter(controller);

    const result = await handler(buildEvent({}), {} as Context, () => {});

    expect(result).toEqual({ statusCode: 200, body: JSON.stringify({ ok: true }) });
  });

  it("returns the HttpError's status code and message", async () => {
    const controller = stubController(async () => {
      throw new HttpError(409, "email already exists");
    });
    const handler = apigwAdapter(controller);

    const result = await handler(buildEvent({}), {} as Context, () => {});

    expect(result).toEqual({ statusCode: 409, body: JSON.stringify({ message: "email already exists" }) });
  });

  it("returns 500 for an unexpected error", async () => {
    const controller = stubController(async () => {
      throw new Error("unexpected failure");
    });
    const handler = apigwAdapter(controller);

    const result = await handler(buildEvent({}), {} as Context, () => {});

    expect(result).toEqual({ statusCode: 500, body: JSON.stringify({ message: "Internal server error" }) });
  });
});
