import type { Theme } from "../../../domain/entities/theme.js";
import type { ThemeTopic } from "../../../domain/entities/theme-topic.js";
import type { ThemeRepository } from "../../../domain/contracts/repositories/theme-repository.js";
import type { ThemeTopicRepository } from "../../../domain/contracts/repositories/theme-topic-repository.js";

export interface ListThemesDeps {
  themeRepository: ThemeRepository;
  themeTopicRepository: ThemeTopicRepository;
}

export interface ListThemesInput {
  topicId?: string;
  search?: string;
}

export interface ThemeWithTopic {
  theme: Theme;
  topic: ThemeTopic | null;
}

export function createListThemes({ themeRepository, themeTopicRepository }: ListThemesDeps) {
  return async function listThemes({ topicId, search }: ListThemesInput = {}): Promise<ThemeWithTopic[]> {
    const themes = await themeRepository.list({ topicId, search });

    const distinctTopicIds = [...new Set(themes.map((theme) => theme.topicId))];
    const topics = await themeTopicRepository.findByIds(distinctTopicIds);
    const topicById = new Map(topics.map((topic) => [topic.id, topic]));

    return themes.map((theme) => ({ theme, topic: topicById.get(theme.topicId) ?? null }));
  };
}
