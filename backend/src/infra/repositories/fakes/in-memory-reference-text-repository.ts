import type { ReferenceText } from "../../../domain/entities/reference-text.js";
import type { ReferenceTextRepository } from "../../../domain/contracts/repositories/reference-text-repository.js";

export class InMemoryReferenceTextRepository implements ReferenceTextRepository {
  constructor(private readonly referenceTexts: ReferenceText[] = []) {}

  async listByThemeId(themeId: string): Promise<ReferenceText[]> {
    return this.referenceTexts.filter((referenceText) => referenceText.themeId === themeId);
  }
}
