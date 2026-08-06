import type { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import type { ControllerAuth, Controller } from "../../application/controllers/controller.js";
import { mapErrorResponse } from "./map-error-response.js";

function resolveAuth(claims: Record<string, string | number | boolean | string[]> | undefined): ControllerAuth | null {
  const sub = claims?.sub;
  return typeof sub === "string" ? { externalId: sub } : null;
}

export function apigwAdapter(controller: Controller): APIGatewayProxyHandlerV2WithJWTAuthorizer {
  return async (event) => {
    let body: unknown = {};
    if (event.body) {
      try {
        body = JSON.parse(event.body);
      } catch {
        return { statusCode: 400, body: JSON.stringify({ message: "Corpo da requisição inválido" }) };
      }
    }

    try {
      const response = await controller.execute({
        body,
        headers: event.headers,
        pathParameters: event.pathParameters ?? {},
        queryStringParameters: event.queryStringParameters ?? {},
        auth: resolveAuth(event.requestContext?.authorizer?.jwt?.claims),
      });

      return { statusCode: response.statusCode, body: JSON.stringify(response.body) };
    } catch (error) {
      return mapErrorResponse(error);
    }
  };
}
