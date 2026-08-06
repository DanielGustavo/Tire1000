import type { APIGatewayProxyEventV2WithJWTAuthorizer, Context } from "aws-lambda";
import { describe, expect, it } from "vitest";
import { Controller, type ControllerRequest, type ControllerResponse } from "../../application/controllers/controller.js";
import { HttpError } from "../../application/controllers/http-error.js";
import { apigwAdapter } from "./apigw-adapter.js";

function buildEvent(body?: unknown, userId?: string): APIGatewayProxyEventV2WithJWTAuthorizer {
  return {
    body: body === undefined ? undefined : JSON.stringify(body),
    headers: {},
    pathParameters: {},
    queryStringParameters: {},
    requestContext: userId
      ? { authorizer: { jwt: { claims: { sub: "cognito-sub-1", userId }, scopes: [] } } }
      : undefined,
  } as unknown as APIGatewayProxyEventV2WithJWTAuthorizer;
}

class StubController extends Controller {
  constructor(private readonly stubbedHandle: (request: ControllerRequest) => Promise<ControllerResponse>) {
    super();
  }

  protected handle(request: ControllerRequest): Promise<ControllerResponse> {
    return this.stubbedHandle(request);
  }
}

describe("apigwAdapter", () => {
  it("returns the controller's response on success", async () => {
    const controller = new StubController(async () => ({ statusCode: 200, body: { ok: true } }));
    const handler = apigwAdapter(controller);

    const result = await handler(buildEvent({}), {} as Context, () => {});

    expect(result).toEqual({ statusCode: 200, body: JSON.stringify({ ok: true }) });
  });

  it("returns the HttpError's status code and message", async () => {
    const controller = new StubController(async () => {
      throw new HttpError(409, "email already exists");
    });
    const handler = apigwAdapter(controller);

    const result = await handler(buildEvent({}), {} as Context, () => {});

    expect(result).toEqual({ statusCode: 409, body: JSON.stringify({ message: "email already exists" }) });
  });

  it("returns 500 for an unexpected error", async () => {
    const controller = new StubController(async () => {
      throw new Error("unexpected failure");
    });
    const handler = apigwAdapter(controller);

    const result = await handler(buildEvent({}), {} as Context, () => {});

    expect(result).toEqual({ statusCode: 500, body: JSON.stringify({ message: "Erro interno do servidor" }) });
  });

  it("passes the JWT authorizer's userId claim through as auth.id", async () => {
    let receivedRequest: ControllerRequest | undefined;
    const controller = new StubController(async (request) => {
      receivedRequest = request;
      return { statusCode: 200, body: {} };
    });
    const handler = apigwAdapter(controller);

    await handler(buildEvent({}, "user-1"), {} as Context, () => {});

    expect(receivedRequest?.auth).toEqual({ id: "user-1" });
  });

  it("sets auth to null for unauthenticated routes with no JWT authorizer context", async () => {
    let receivedRequest: ControllerRequest | undefined;
    const controller = new StubController(async (request) => {
      receivedRequest = request;
      return { statusCode: 200, body: {} };
    });
    const handler = apigwAdapter(controller);

    await handler(buildEvent({}), {} as Context, () => {});

    expect(receivedRequest?.auth).toBeNull();
  });
});
