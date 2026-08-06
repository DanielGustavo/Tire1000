import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import type { Controller } from "../../application/controllers/controller.js";
import { mapErrorResponse } from "./map-error-response.js";

// Stripe signs the exact raw request body — unlike apigwAdapter, this must not JSON.parse it,
// or signature verification (stripe.webhooks.constructEvent) breaks.
export function stripeWebhookAdapter(controller: Controller): APIGatewayProxyHandlerV2 {
  return async (event) => {
    const payload = event.isBase64Encoded ? Buffer.from(event.body ?? "", "base64").toString("utf8") : (event.body ?? "");

    try {
      const response = await controller.execute({
        body: payload,
        headers: event.headers,
        pathParameters: event.pathParameters ?? {},
        queryStringParameters: event.queryStringParameters ?? {},
        auth: null,
      });

      return { statusCode: response.statusCode, body: JSON.stringify(response.body) };
    } catch (error) {
      return mapErrorResponse(error);
    }
  };
}
