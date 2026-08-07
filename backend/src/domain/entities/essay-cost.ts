import { Entity } from "./entity.js";

export type EssayCostStep = "VALIDATION" | "EVALUATION";

export interface EssayCostProps {
  id: string;
  essayId: string;
  userId: string;
  step: EssayCostStep;
  tokens: number;
  amountInCents: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewEssayCostProps {
  id: string;
  essayId: string;
  userId: string;
  step: EssayCostStep;
  tokens: number;
  amountInCents: number;
}

/** One record per AI call an essay goes through (Revisão, Avaliação) — operator-facing cost tracking (spec's story 30). */
export class EssayCost extends Entity {
  declare readonly type: "ESSAY_COST";

  readonly essayId: string;
  readonly userId: string;
  readonly step: EssayCostStep;
  readonly tokens: number;
  readonly amountInCents: number;

  private constructor(props: EssayCostProps) {
    super({ id: props.id, type: "ESSAY_COST", createdAt: props.createdAt, updatedAt: props.updatedAt });
    this.essayId = props.essayId;
    this.userId = props.userId;
    this.step = props.step;
    this.tokens = props.tokens;
    this.amountInCents = props.amountInCents;
  }

  static create({ id, essayId, userId, step, tokens, amountInCents }: NewEssayCostProps): EssayCost {
    const now = new Date();
    return new EssayCost({ id, essayId, userId, step, tokens, amountInCents, createdAt: now, updatedAt: now });
  }

  static reconstitute(props: EssayCostProps): EssayCost {
    return new EssayCost(props);
  }
}
