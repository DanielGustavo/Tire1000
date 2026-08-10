import { Essay, type EssayStatus } from "../../../domain/entities/essay.js";
import type { EssayEvaluationRepository } from "../../../domain/contracts/repositories/essay-evaluation-repository.js";
import type { EssayRepository, EssayWithEvaluation } from "../../../domain/contracts/repositories/essay-repository.js";
import { InMemoryEssayEvaluationRepository } from "./in-memory-essay-evaluation-repository.js";

// Essay is mutable (see Essay#resetForResend/#markQueued). Clone on the way in and out, same
// reasoning as InMemoryCheckoutRepository: a real store never hands back the object it stored.
function cloneEssay(essay: Essay): Essay {
  return Essay.reconstitute({
    id: essay.id,
    status: essay.status,
    validationAttempts: essay.validationAttempts,
    rejectedAttempts: essay.rejectedAttempts,
    rejectionReasons: [...essay.rejectionReasons],
    fileKey: essay.fileKey,
    textContent: essay.textContent,
    evaluationAttempts: essay.evaluationAttempts,
    finalScore: essay.finalScore,
    userId: essay.userId,
    themeId: essay.themeId,
    themeTitle: essay.themeTitle,
    topicColor: essay.topicColor,
    enemYear: essay.enemYear,
    topicTitle: essay.topicTitle,
    createdAt: essay.createdAt,
    updatedAt: essay.updatedAt,
  });
}

export class InMemoryEssayRepository implements EssayRepository {
  private readonly essaysById = new Map<string, Essay>();

  /**
   * Mirrors the real table's single-store backing for `findByIdWithEvaluation` (DynamoEssayRepository
   * needs no such dependency — it just queries GSI1 directly). Pass the same InMemoryEssayEvaluationRepository
   * instance a test writes evaluations through so `findByIdWithEvaluation` sees them; tests that never
   * call it (state-machine use cases) can ignore this constructor param entirely.
   */
  constructor(private readonly essayEvaluationRepository: EssayEvaluationRepository = new InMemoryEssayEvaluationRepository()) {}

  async create(essay: Essay): Promise<Essay> {
    this.essaysById.set(essay.id, cloneEssay(essay));
    return essay;
  }

  async findById(essayId: string): Promise<Essay | null> {
    const stored = this.essaysById.get(essayId);
    return stored ? cloneEssay(stored) : null;
  }

  async findByIdWithEvaluation(essayId: string): Promise<EssayWithEvaluation | null> {
    const essay = await this.findById(essayId);
    if (!essay) return null;

    const evaluation = await this.essayEvaluationRepository.findByEssayId(essayId);
    return { essay, evaluation };
  }

  async listByUserId(userId: string): Promise<Essay[]> {
    return [...this.essaysById.values()]
      .filter((essay) => essay.userId === userId)
      // Mirrors DynamoEssayRepository#listByUserId: KSUID ids sort chronologically, newest first.
      .sort((a, b) => (a.id < b.id ? 1 : -1))
      .map(cloneEssay);
  }

  async updateStatus(essay: Essay, { expectedCurrentStatus }: { expectedCurrentStatus: EssayStatus }): Promise<{ applied: boolean }> {
    const current = this.essaysById.get(essay.id);
    if (!current || current.status !== expectedCurrentStatus) return { applied: false };

    this.essaysById.set(essay.id, cloneEssay(essay));
    return { applied: true };
  }
}
