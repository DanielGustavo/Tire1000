import type { Theme } from "../../../domain/entities/theme.js";
import type { ListThemesFilter, ThemeRepository } from "../../../domain/contracts/repositories/theme-repository.js";

export class InMemoryThemeRepository implements ThemeRepository {
  constructor(private readonly themes: Theme[] = []) {}

  async findById(id: string): Promise<Theme | null> {
    return this.themes.find((theme) => theme.id === id) ?? null;
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
