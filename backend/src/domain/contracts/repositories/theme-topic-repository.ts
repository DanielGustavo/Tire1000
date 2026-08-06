import type { ThemeTopic } from "../../entities/theme-topic.js";

export interface ThemeTopicRepository {
  list(): Promise<ThemeTopic[]>;
}
