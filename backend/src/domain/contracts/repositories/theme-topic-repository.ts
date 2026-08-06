import type { ThemeTopic } from "../../entities/theme-topic.js";

export interface ThemeTopicRepository {
  list(): Promise<ThemeTopic[]>;
  findById(id: string): Promise<ThemeTopic | null>;
  findByIds(ids: string[]): Promise<ThemeTopic[]>;
}
