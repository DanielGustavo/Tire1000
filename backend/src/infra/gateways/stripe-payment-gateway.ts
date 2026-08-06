import Stripe from "stripe";
import {
  InvalidWebhookSignatureError,
  type CreateCheckoutSessionInput,
  type CreateCheckoutSessionOutput,
  type ParseWebhookEventInput,
  type PaymentGateway,
  type PaymentWebhookEvent,
} from "../../domain/contracts/gateways/payment-gateway.js";

export class StripePaymentGateway implements PaymentGateway {
  constructor(
    private readonly priceId: string = process.env.STRIPE_PRICE_ID ?? "",
    private readonly webhookSecret: string = process.env.STRIPE_WEBHOOK_SECRET ?? "",
    private readonly successUrl: string = `${process.env.FRONTEND_URL ?? ""}/credits?checkout=success`,
    private readonly cancelUrl: string = `${process.env.FRONTEND_URL ?? ""}/credits?checkout=cancel`,
    private readonly client: Stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? ""),
  ) {}

  async createCheckoutSession({ userId, creditsQty }: CreateCheckoutSessionInput): Promise<CreateCheckoutSessionOutput> {
    const session = await this.client.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: this.priceId, quantity: creditsQty }],
      client_reference_id: userId,
      success_url: this.successUrl,
      cancel_url: this.cancelUrl,
    });

    if (!session.url) {
      throw new Error("Stripe não retornou uma URL de checkout");
    }

    return { externalId: session.id, checkoutUrl: session.url };
  }

  parseWebhookEvent({ payload, signature }: ParseWebhookEventInput): PaymentWebhookEvent {
    let event: Stripe.Event;
    try {
      event = this.client.webhooks.constructEvent(payload, signature, this.webhookSecret);
    } catch {
      throw new InvalidWebhookSignatureError();
    }

    if (event.type !== "checkout.session.completed") {
      return { type: "IGNORED" };
    }

    const session = event.data.object as Stripe.Checkout.Session;
    return { type: "CHECKOUT_COMPLETED", externalId: session.id, amountInCents: session.amount_total ?? 0 };
  }
}
