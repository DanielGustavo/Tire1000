import type { ThemeTopicRepository } from "../../../domain/contracts/repositories/theme-topic-repository.js";
import { toTopicDTO, type TopicDTO } from "../../dtos/topic-dto.js";

export interface ListTopicsDeps {
  themeTopicRepository: ThemeTopicRepository;
}

export function createListTopics({ themeTopicRepository }: ListTopicsDeps) {
  return async function listTopics(): Promise<TopicDTO[]> {
    const topics = await themeTopicRepository.list();
    return topics.map(toTopicDTO);
  };
}
