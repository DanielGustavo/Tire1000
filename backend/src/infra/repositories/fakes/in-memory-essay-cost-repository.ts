import type { EssayCost } from "../../../domain/entities/essay-cost.js";
import type { EssayCostRepository } from "../../../domain/contracts/repositories/essay-cost-repository.js";

export class InMemoryEssayCostRepository implements EssayCostRepository {
  readonly created: EssayCost[] = [];

  async create(essayCost: EssayCost): Promise<EssayCost> {
    this.created.push(essayCost);
    return essayCost;
  }
}
