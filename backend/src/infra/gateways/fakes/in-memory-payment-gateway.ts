import {
  InvalidWebhookSignatureError,
  type CreateCheckoutSessionInput,
  type CreateCheckoutSessionOutput,
  type ParseWebhookEventInput,
  type PaymentGateway,
  type PaymentWebhookEvent,
} from "../../../domain/contracts/gateways/payment-gateway.js";

const FAKE_SIGNATURE = "fake-signature";

export class InMemoryPaymentGateway implements PaymentGateway {
  readonly createdSessions: CreateCheckoutSessionInput[] = [];
  private counter = 0;

  async createCheckoutSession(input: CreateCheckoutSessionInput): Promise<CreateCheckoutSessionOutput> {
    this.counter += 1;
    this.createdSessions.push(input);
    const externalId = `fake-checkout-session-${this.counter}`;
    return { externalId, checkoutUrl: `https://checkout.stripe.test/${externalId}` };
  }

  parseWebhookEvent({ payload, signature }: ParseWebhookEventInput): PaymentWebhookEvent {
    if (signature !== FAKE_SIGNATURE) {
      throw new InvalidWebhookSignatureError();
    }
    return JSON.parse(payload) as PaymentWebhookEvent;
  }

  /** Builds a {payload, signature} pair that parseWebhookEvent accepts, for use in tests. */
  buildCheckoutCompletedWebhook(input: { externalId: string; amountInCents: number }): ParseWebhookEventInput {
    const event: PaymentWebhookEvent = { type: "CHECKOUT_COMPLETED", ...input };
    return { payload: JSON.stringify(event), signature: FAKE_SIGNATURE };
  }

  /** Builds a {payload, signature} pair for a Stripe event type the app doesn't act on. */
  buildIgnoredWebhook(): ParseWebhookEventInput {
    const event: PaymentWebhookEvent = { type: "IGNORED" };
    return { payload: JSON.stringify(event), signature: FAKE_SIGNATURE };
  }
}
