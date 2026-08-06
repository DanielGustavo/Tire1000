export type EntityType =
  | "USER"
  | "THEME"
  | "TOPIC"
  | "REFERENCE_TEXT"
  | "ESSAY"
  | "ESSAY_EVALUATION"
  | "ESSAY_COST"
  | "CHECKOUT";

export interface EntityProps {
  id: string;
  type: EntityType;
  createdAt: Date;
  updatedAt: Date;
}

export abstract class Entity {
  readonly id: string;
  readonly type: EntityType;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  protected constructor({ id, type, createdAt, updatedAt }: EntityProps) {
    this.id = id;
    this.type = type;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
