import { describe, expect, it } from "vitest";
import { NotFoundError } from "../../../shared/errors/not-found-error.js";
import type { ControllerAuth } from "../controller.js";
import { RequestCreditsCheckoutController } from "./request-credits-checkout-controller.js";

function buildRequest(body: unknown, auth: ControllerAuth | null = { id: "user-1" }) {
  return { body, headers: {}, pathParameters: {}, queryStringParameters: {}, auth };
}

describe("RequestCreditsCheckoutController", () => {
  it("returns 201 with the checkoutUrl from the use case", async () => {
    const controller = new RequestCreditsCheckoutController(async () => ({ checkoutUrl: "https://checkout.stripe.test/1" }));

    const response = await controller.execute(buildRequest({ creditsQty: 10 }));

    expect(response).toEqual({ statusCode: 201, body: { checkoutUrl: "https://checkout.stripe.test/1" } });
  });

  it("passes the authenticated user's id and the requested creditsQty to the use case", async () => {
    let receivedInput: unknown;
    const controller = new RequestCreditsCheckoutController(async (input) => {
      receivedInput = input;
      return { checkoutUrl: "https://checkout.stripe.test/1" };
    });

    await controller.execute(buildRequest({ creditsQty: 10 }, { id: "user-1" }));

    expect(receivedInput).toEqual({ id: "user-1", creditsQty: 10 });
  });

  it("throws a 401 HttpError when there is no authenticated user", async () => {
    const controller = new RequestCreditsCheckoutController(async () => {
      throw new Error("should not be called");
    });

    await expect(controller.execute(buildRequest({ creditsQty: 10 }, null))).rejects.toMatchObject({ statusCode: 401 });
  });

  it("throws a 400 HttpError when creditsQty is missing or not a positive integer", async () => {
    const controller = new RequestCreditsCheckoutController(async () => {
      throw new Error("should not be called");
    });

    await expect(controller.execute(buildRequest({ creditsQty: 0 }))).rejects.toMatchObject({ statusCode: 400 });
    await expect(controller.execute(buildRequest({}))).rejects.toMatchObject({ statusCode: 400 });
  });

  it("throws a 404 HttpError when the use case cannot resolve the authenticated user", async () => {
    const controller = new RequestCreditsCheckoutController(async () => {
      throw new NotFoundError("Usuário não encontrado");
    });

    await expect(controller.execute(buildRequest({ creditsQty: 10 }))).rejects.toMatchObject({ statusCode: 404 });
  });
});
