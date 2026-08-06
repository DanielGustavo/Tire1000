import type { ThemeTopic } from "../../domain/entities/theme-topic.js";

export interface TopicDTO {
  id: string;
  title: string;
  color: string;
}

export function toTopicDTO(topic: ThemeTopic): TopicDTO {
  return { id: topic.id, title: topic.title, color: topic.color };
}
