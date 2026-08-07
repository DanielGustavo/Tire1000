import { EssayEvaluation } from "../../../domain/entities/essay-evaluation.js";
import type { EssayEvaluationRepository } from "../../../domain/contracts/repositories/essay-evaluation-repository.js";

export class InMemoryEssayEvaluationRepository implements EssayEvaluationRepository {
  private readonly byEssayId = new Map<string, EssayEvaluation>();

  async create(essayEvaluation: EssayEvaluation): Promise<EssayEvaluation> {
    this.byEssayId.set(essayEvaluation.essayId, essayEvaluation);
    return essayEvaluation;
  }

  async findByEssayId(essayId: string): Promise<EssayEvaluation | null> {
    return this.byEssayId.get(essayId) ?? null;
  }
}
