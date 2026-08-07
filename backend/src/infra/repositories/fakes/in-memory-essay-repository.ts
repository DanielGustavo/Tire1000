import { Essay, type EssayStatus } from "../../../domain/entities/essay.js";
import type { EssayRepository } from "../../../domain/contracts/repositories/essay-repository.js";

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
    createdAt: essay.createdAt,
    updatedAt: essay.updatedAt,
  });
}

export class InMemoryEssayRepository implements EssayRepository {
  private readonly essaysById = new Map<string, Essay>();

  async create(essay: Essay): Promise<Essay> {
    this.essaysById.set(essay.id, cloneEssay(essay));
    return essay;
  }

  async findById(essayId: string): Promise<Essay | null> {
    const stored = this.essaysById.get(essayId);
    return stored ? cloneEssay(stored) : null;
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
