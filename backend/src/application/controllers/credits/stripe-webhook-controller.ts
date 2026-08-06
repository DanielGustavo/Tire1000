import type { createConfirmCreditsCheckout } from "../../use-cases/confirm-credits-checkout/confirm-credits-checkout.js";
import { BadRequestError } from "../../../shared/errors/bad-request-error.js";
import { Controller, type ControllerRequest, type ControllerResponse } from "../controller.js";

type ConfirmCreditsCheckout = ReturnType<typeof createConfirmCreditsCheckout>;

export class StripeWebhookController extends Controller {
  constructor(private readonly confirmCreditsCheckout: ConfirmCreditsCheckout) {
    super();
  }

  protected async handle({ body, headers }: ControllerRequest): Promise<ControllerResponse> {
    const signature = headers["stripe-signature"];
    if (!signature) throw new BadRequestError("Assinatura do Stripe ausente");
    if (typeof body !== "string") throw new BadRequestError("Corpo da requisição inválido");

    await this.confirmCreditsCheckout({ payload: body, signature });

    return { statusCode: 200, body: { received: true } };
  }
}
