import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import type { Controller } from "../../application/controllers/controller.js";
import { HttpError } from "../../application/controllers/http-error.js";

export function apigwAdapter(controller: Controller): APIGatewayProxyHandlerV2 {
  return async (event) => {
    let body: unknown = {};
    if (event.body) {
      try {
        body = JSON.parse(event.body);
      } catch {
        return { statusCode: 400, body: JSON.stringify({ message: "Invalid JSON body" }) };
      }
    }

    try {
      const response = await controller.handle({
        body,
        headers: event.headers,
        pathParameters: event.pathParameters ?? {},
        queryStringParameters: event.queryStringParameters ?? {},
      });

      return { statusCode: response.statusCode, body: JSON.stringify(response.body) };
    } catch (error) {
      if (error instanceof HttpError) {
        return { statusCode: error.statusCode, body: JSON.stringify({ message: error.message }) };
      }
      console.error(error);
      return { statusCode: 500, body: JSON.stringify({ message: "Internal server error" }) };
    }
  };
}
