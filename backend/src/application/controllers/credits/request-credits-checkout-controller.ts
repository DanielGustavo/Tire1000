import type { createRequestCreditsCheckout } from "../../use-cases/request-credits-checkout/request-credits-checkout.js";
import { UnauthorizedError } from "../../../shared/errors/unauthorized-error.js";
import { Controller, type ControllerRequest, type ControllerResponse } from "../controller.js";
import { RequestCreditsCheckoutSchema } from "./request-credits-checkout-schema.js";

type RequestCreditsCheckout = ReturnType<typeof createRequestCreditsCheckout>;

export class RequestCreditsCheckoutController extends Controller {
  private readonly schema = new RequestCreditsCheckoutSchema();

  constructor(private readonly requestCreditsCheckout: RequestCreditsCheckout) {
    super();
  }

  protected async handle({ body, auth }: ControllerRequest): Promise<ControllerResponse> {
    if (!auth) throw new UnauthorizedError();

    const { creditsQty } = this.schema.parse(body);
    const result = await this.requestCreditsCheckout({ id: auth.id, creditsQty });

    return { statusCode: 201, body: result };
  }
}
