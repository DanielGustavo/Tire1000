import type { EssayCost } from "../../entities/essay-cost.js";

export interface EssayCostRepository {
  create(essayCost: EssayCost): Promise<EssayCost>;
}
