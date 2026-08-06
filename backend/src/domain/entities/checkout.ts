import { Entity } from "./entity.js";

export type CheckoutGateway = "STRIPE";
export type CheckoutStatus = "PENDING" | "COMPLETED" | "FAILED";

export interface CheckoutProps {
  id: string;
  externalId: string;
  gateway: CheckoutGateway;
  status: CheckoutStatus;
  amountInCents: number | null;
  creditsQty: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewCheckoutProps {
  id: string;
  externalId: string;
  creditsQty: number;
  userId: string;
}

export class Checkout extends Entity {
  declare readonly type: "CHECKOUT";

  readonly externalId: string;
  readonly gateway: CheckoutGateway;
  readonly status: CheckoutStatus;
  readonly amountInCents: number | null;
  readonly creditsQty: number;
  readonly userId: string;

  private constructor(props: CheckoutProps) {
    super({ id: props.id, type: "CHECKOUT", createdAt: props.createdAt, updatedAt: props.updatedAt });
    this.externalId = props.externalId;
    this.gateway = props.gateway;
    this.status = props.status;
    this.amountInCents = props.amountInCents;
    this.creditsQty = props.creditsQty;
    this.userId = props.userId;
  }

  static create({ id, externalId, creditsQty, userId }: NewCheckoutProps): Checkout {
    const now = new Date();
    return new Checkout({
      id,
      externalId,
      gateway: "STRIPE",
      status: "PENDING",
      amountInCents: null,
      creditsQty,
      userId,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: CheckoutProps): Checkout {
    return new Checkout(props);
  }

  complete({ amountInCents }: { amountInCents: number }): Checkout {
    return new Checkout({
      id: this.id,
      externalId: this.externalId,
      gateway: this.gateway,
      status: "COMPLETED",
      amountInCents,
      creditsQty: this.creditsQty,
      userId: this.userId,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }
}
