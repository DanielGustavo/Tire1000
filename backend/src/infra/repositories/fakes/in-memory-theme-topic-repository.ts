import type { ThemeTopic } from "../../../domain/entities/theme-topic.js";
import type { ThemeTopicRepository } from "../../../domain/contracts/repositories/theme-topic-repository.js";

export class InMemoryThemeTopicRepository implements ThemeTopicRepository {
  constructor(private readonly topics: ThemeTopic[] = []) {}

  async list(): Promise<ThemeTopic[]> {
    return [...this.topics];
  }

  async findById(id: string): Promise<ThemeTopic | null> {
    return this.topics.find((topic) => topic.id === id) ?? null;
  }

  async findByIds(ids: string[]): Promise<ThemeTopic[]> {
    return this.topics.filter((topic) => ids.includes(topic.id));
  }
}
