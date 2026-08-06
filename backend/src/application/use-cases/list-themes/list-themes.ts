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
    const themes = await themeRepository.list({ topicId, search });

    const distinctTopicIds = [...new Set(themes.map((theme) => theme.topicId))];
    const topics = await themeTopicRepository.findByIds(distinctTopicIds);
    const topicById = new Map(topics.map((topic) => [topic.id, topic]));

    return themes.map((theme) => {
      const topic = topicById.get(theme.topicId);
      return { theme: toThemeDTO(theme), topic: topic ? toTopicDTO(topic) : null };
    });
  };
}
