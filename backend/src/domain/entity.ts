export type EntityType =
  | "USER"
  | "THEME"
  | "TOPIC"
  | "REFERENCE_TEXT"
  | "ESSAY"
  | "ESSAY_EVALUATION"
  | "ESSAY_COST"
  | "CHECKOUT";

export interface Entity {
  id: string;
  type: EntityType;
  createdAt: string;
  updatedAt: string;
}
