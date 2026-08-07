import type { EssayEvaluation } from "../../entities/essay-evaluation.js";

export interface EssayEvaluationRepository {
  create(essayEvaluation: EssayEvaluation): Promise<EssayEvaluation>;
  findByEssayId(essayId: string): Promise<EssayEvaluation | null>;
}
