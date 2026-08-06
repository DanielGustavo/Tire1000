import { BadRequestError } from "../../../shared/errors/bad-request-error.js";

export interface CreateCheckoutSessionInput {
  userId: string;
  creditsQty: number;
}

export interface CreateCheckoutSessionOutput {
  externalId: string;
  checkoutUrl: string;
}

export interface ParseWebhookEventInput {
  payload: string;
  signature: string;
}

export interface CheckoutCompletedEvent {
  type: "CHECKOUT_COMPLETED";
  externalId: string;
  amountInCents: number;
}

export interface IgnoredWebhookEvent {
  type: "IGNORED";
}

export type PaymentWebhookEvent = CheckoutCompletedEvent | IgnoredWebhookEvent;

export interface PaymentGateway {
  createCheckoutSession(input: CreateCheckoutSessionInput): Promise<CreateCheckoutSessionOutput>;
  parseWebhookEvent(input: ParseWebhookEventInput): PaymentWebhookEvent;
}

export class InvalidWebhookSignatureError extends BadRequestError {
  constructor() {
    super("Assinatura do webhook inválida");
  }
}
