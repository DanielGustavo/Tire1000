import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import type { Controller } from "../../application/controllers/controller.js";

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

    const response = await controller.handle({
      body,
      headers: event.headers,
      pathParameters: event.pathParameters ?? {},
      queryStringParameters: event.queryStringParameters ?? {},
    });

    return { statusCode: response.statusCode, body: JSON.stringify(response.body) };
  };
}
