import { ThemeTopic } from "../../../../domain/entities/theme-topic.js";

export interface ThemeTopicItem {
  PK: string;
  SK: string;
  GSI1PK: string;
  GSI1SK: string;
  id: string;
  type: "TOPIC";
  title: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export function themeTopicPK(): string {
  return "TOPICS";
}

export function themeTopicSK(topicId: string): string {
  return `TOPIC#${topicId}`;
}

export function themeTopicGSI1PK(topicId: string): string {
  return `TOPIC#${topicId}`;
}

// Sorts before `THEME#...` in ASCII, so the topic itself appears first among its themes on GSI1.
export function themeTopicGSI1SK(topicId: string): string {
  return `#TOPIC#${topicId}`;
}

export function toThemeTopicItem(topic: ThemeTopic): ThemeTopicItem {
  return {
    PK: themeTopicPK(),
    SK: themeTopicSK(topic.id),
    GSI1PK: themeTopicGSI1PK(topic.id),
    GSI1SK: themeTopicGSI1SK(topic.id),
    id: topic.id,
    type: topic.type,
    title: topic.title,
    color: topic.color,
    createdAt: topic.createdAt.toISOString(),
    updatedAt: topic.updatedAt.toISOString(),
  };
}

export function fromThemeTopicItem(item: ThemeTopicItem): ThemeTopic {
  return ThemeTopic.reconstitute({
    id: item.id,
    title: item.title,
    color: item.color,
    createdAt: new Date(item.createdAt),
    updatedAt: new Date(item.updatedAt),
  });
}
