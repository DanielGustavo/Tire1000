import type { ThemeTopic } from "../../../domain/entities/theme-topic.js";
import type { ThemeTopicRepository } from "../../../domain/contracts/repositories/theme-topic-repository.js";

export interface ListTopicsDeps {
  themeTopicRepository: ThemeTopicRepository;
}

export function createListTopics({ themeTopicRepository }: ListTopicsDeps) {
  return async function listTopics(): Promise<ThemeTopic[]> {
    return themeTopicRepository.list();
  };
}
