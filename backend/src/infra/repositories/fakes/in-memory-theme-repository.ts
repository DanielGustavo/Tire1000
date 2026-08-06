import type { ReferenceText } from "../../../domain/entities/reference-text.js";
import type { Theme } from "../../../domain/entities/theme.js";
import type {
  ListThemesFilter,
  ThemeRepository,
  ThemeWithReferenceTexts,
} from "../../../domain/contracts/repositories/theme-repository.js";

export class InMemoryThemeRepository implements ThemeRepository {
  constructor(
    private readonly themes: Theme[] = [],
    private readonly referenceTexts: ReferenceText[] = [],
  ) {}

  async findById(id: string): Promise<ThemeWithReferenceTexts | null> {
    const theme = this.themes.find((theme) => theme.id === id);
    if (!theme) return null;

    return { theme, referenceTexts: this.referenceTexts.filter((text) => text.themeId === id) };
  }

  async list({ topicId, search }: ListThemesFilter = {}): Promise<Theme[]> {
    let result = this.themes;
    if (topicId) result = result.filter((theme) => theme.topicId === topicId);
    if (search) result = result.filter((theme) => theme.title.includes(search));

    return [...result].sort(
      (a, b) => b.publicationDate.getTime() - a.publicationDate.getTime() || b.id.localeCompare(a.id),
    );
  }
}
