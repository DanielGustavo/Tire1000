import type { Entity } from "./entity.js";

export interface User extends Entity {
  type: "USER";
  externalId: string;
  email: string;
  name: string;
  credits: number;
}
