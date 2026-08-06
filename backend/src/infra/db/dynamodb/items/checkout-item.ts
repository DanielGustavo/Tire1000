import { Checkout, type CheckoutGateway, type CheckoutStatus } from "../../../../domain/entities/checkout.js";

export interface CheckoutItem {
  PK: string;
  SK: string;
  id: string;
  type: "CHECKOUT";
  externalId: string;
  gateway: CheckoutGateway;
  status: CheckoutStatus;
  amountInCents: number | null;
  creditsQty: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export function checkoutPK(externalId: string): string {
  return `CHECKOUT#${externalId}`;
}

export function checkoutSK(externalId: string): string {
  return `CHECKOUT#${externalId}`;
}

export function toCheckoutItem(checkout: Checkout): CheckoutItem {
  return {
    PK: checkoutPK(checkout.externalId),
    SK: checkoutSK(checkout.externalId),
    id: checkout.id,
    type: checkout.type,
    externalId: checkout.externalId,
    gateway: checkout.gateway,
    status: checkout.status,
    amountInCents: checkout.amountInCents,
    creditsQty: checkout.creditsQty,
    userId: checkout.userId,
    createdAt: checkout.createdAt.toISOString(),
    updatedAt: checkout.updatedAt.toISOString(),
  };
}

export function fromCheckoutItem(item: CheckoutItem): Checkout {
  return Checkout.reconstitute({
    id: item.id,
    externalId: item.externalId,
    gateway: item.gateway,
    status: item.status,
    amountInCents: item.amountInCents,
    creditsQty: item.creditsQty,
    userId: item.userId,
    createdAt: new Date(item.createdAt),
    updatedAt: new Date(item.updatedAt),
  });
}
