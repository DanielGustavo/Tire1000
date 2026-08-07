import { EssayCost, type EssayCostStep } from "../../../../domain/entities/essay-cost.js";

export interface EssayCostItem {
  PK: string;
  SK: string;
  GSI1PK: string;
  GSI1SK: string;
  id: string;
  type: "ESSAY_COST";
  essayId: string;
  userId: string;
  step: EssayCostStep;
  tokens: number;
  amountInCents: number;
  createdAt: string;
  updatedAt: string;
}

export function essayCostPK(essayId: string): string {
  return `ESSAY_COST#${essayId}`;
}

export function essayCostSK(id: string): string {
  return `ESSAY_COST#${id}`;
}

export function essayCostGSI1PK(userId: string): string {
  return `USER#${userId}`;
}

export function toEssayCostItem(essayCost: EssayCost): EssayCostItem {
  return {
    PK: essayCostPK(essayCost.essayId),
    SK: essayCostSK(essayCost.id),
    GSI1PK: essayCostGSI1PK(essayCost.userId),
    GSI1SK: essayCostSK(essayCost.id),
    id: essayCost.id,
    type: essayCost.type,
    essayId: essayCost.essayId,
    userId: essayCost.userId,
    step: essayCost.step,
    tokens: essayCost.tokens,
    amountInCents: essayCost.amountInCents,
    createdAt: essayCost.createdAt.toISOString(),
    updatedAt: essayCost.updatedAt.toISOString(),
  };
}

export function fromEssayCostItem(item: EssayCostItem): EssayCost {
  return EssayCost.reconstitute({
    id: item.id,
    essayId: item.essayId,
    userId: item.userId,
    step: item.step,
    tokens: item.tokens,
    amountInCents: item.amountInCents,
    createdAt: new Date(item.createdAt),
    updatedAt: new Date(item.updatedAt),
  });
}
