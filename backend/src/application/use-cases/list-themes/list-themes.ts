import type { ThemeRepository } from "../../../domain/contracts/repositories/theme-repository.js";
import type { ThemeTopicRepository } from "../../../domain/contracts/repositories/theme-topic-repository.js";
import { toThemeDTO, type ThemeDTO } from "../../dtos/theme-dto.js";
import { toTopicDTO, type TopicDTO } from "../../dtos/topic-dto.js";

export interface ListThemesDeps {
  themeRepository: ThemeRepository;
  themeTopicRepository: ThemeTopicRepository;
}

export interface ListThemesInput {
  topicId?: string;
  search?: string;
}

export interface ThemeWithTopic {
  theme: ThemeDTO;
  topic: TopicDTO | null;
}

export function createListThemes({ themeRepository, themeTopicRepository }: ListThemesDeps) {
  return async function listThemes({ topicId, search }: ListThemesInput = {}): Promise<ThemeWithTopic[]> {
    const themes = await themeRepository.list({ topicId });

    const distinctTopicIds = [...new Set(themes.map((theme) => theme.topicId))];
    const topics = await themeTopicRepository.findByIds(distinctTopicIds);
    const topicById = new Map(topics.map((topic) => [topic.id, topic]));

    const themesWithTopics = themes.map((theme) => {
      const topic = topicById.get(theme.topicId);
      return { theme: toThemeDTO(theme), topic: topic ? toTopicDTO(topic) : null };
    });

    if (!search) return themesWithTopics;

    // Single free-text field covers title, ENEM year, and eixo (topic) — no separate
    // controls or token parsing, matched case-insensitively against a composed string.
    const searchLower = search.toLowerCase();
    return themesWithTopics.filter(({ theme, topic }) => {
      const searchable = `${theme.enemYear ?? "tire 1000"} | ${theme.title} | ${topic?.title ?? ""}`;
      return searchable.toLowerCase().includes(searchLower);
    });
  };
}
