import { describe, expect, it } from "vitest";
import { InvalidWebhookSignatureError } from "../../../domain/contracts/gateways/payment-gateway.js";
import { StripeWebhookController } from "./stripe-webhook-controller.js";

function buildRequest(body: unknown, headers: Record<string, string | undefined> = { "stripe-signature": "sig" }) {
  return { body, headers, pathParameters: {}, queryStringParameters: {}, auth: null };
}

describe("StripeWebhookController", () => {
  it("returns 200 and forwards the raw payload and signature to the use case", async () => {
    let receivedInput: unknown;
    const controller = new StripeWebhookController(async (input) => {
      receivedInput = input;
      return { confirmed: true };
    });

    const response = await controller.execute(buildRequest("{\"raw\":true}", { "stripe-signature": "sig-1" }));

    expect(response).toEqual({ statusCode: 200, body: { received: true } });
    expect(receivedInput).toEqual({ payload: "{\"raw\":true}", signature: "sig-1" });
  });

  it("throws a 400 HttpError when the stripe-signature header is missing", async () => {
    const controller = new StripeWebhookController(async () => {
      throw new Error("should not be called");
    });

    await expect(controller.execute(buildRequest("{}", {}))).rejects.toMatchObject({ statusCode: 400 });
  });

  it("throws a 400 HttpError when the use case rejects an invalid signature", async () => {
    const controller = new StripeWebhookController(async () => {
      throw new InvalidWebhookSignatureError();
    });

    await expect(controller.execute(buildRequest("{}"))).rejects.toMatchObject({ statusCode: 400 });
  });
});
