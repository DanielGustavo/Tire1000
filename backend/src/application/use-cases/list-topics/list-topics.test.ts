import { describe, expect, it } from "vitest";
import { ThemeTopic, type ThemeTopicProps } from "../../../domain/entities/theme-topic.js";
import { InMemoryThemeTopicRepository } from "../../../infra/repositories/fakes/in-memory-theme-topic-repository.js";
import { createListTopics } from "./list-topics.js";

function buildTopic(overrides: Partial<ThemeTopicProps> = {}): ThemeTopic {
  return ThemeTopic.reconstitute({
    id: "topic-1",
    title: "Meio ambiente",
    color: "#2E7D32",
    createdAt: new Date("2026-08-01T00:00:00.000Z"),
    updatedAt: new Date("2026-08-01T00:00:00.000Z"),
    ...overrides,
  });
}

describe("ListTopics", () => {
  it("lists all topics", async () => {
    const topics = [buildTopic({ id: "topic-1" }), buildTopic({ id: "topic-2", title: "Tecnologia" })];
    const themeTopicRepository = new InMemoryThemeTopicRepository(topics);
    const listTopics = createListTopics({ themeTopicRepository });

    const result = await listTopics();

    expect(result).toEqual(topics);
  });

  it("returns an empty list when there are no topics", async () => {
    const themeTopicRepository = new InMemoryThemeTopicRepository();
    const listTopics = createListTopics({ themeTopicRepository });

    const result = await listTopics();

    expect(result).toEqual([]);
  });
});
