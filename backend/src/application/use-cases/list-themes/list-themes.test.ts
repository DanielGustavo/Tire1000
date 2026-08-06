import { describe, expect, it } from "vitest";
import { Theme, type ThemeProps } from "../../../domain/entities/theme.js";
import { ThemeTopic, type ThemeTopicProps } from "../../../domain/entities/theme-topic.js";
import { InMemoryThemeRepository } from "../../../infra/repositories/fakes/in-memory-theme-repository.js";
import { InMemoryThemeTopicRepository } from "../../../infra/repositories/fakes/in-memory-theme-topic-repository.js";
import { createListThemes } from "./list-themes.js";

function buildTheme(overrides: Partial<ThemeProps> = {}): Theme {
  return Theme.reconstitute({
    id: "theme-1",
    title: "A importância da educação financeira no Brasil",
    enemYear: null,
    topicId: "topic-1",
    createdAt: new Date("2026-08-01T00:00:00.000Z"),
    updatedAt: new Date("2026-08-01T00:00:00.000Z"),
    ...overrides,
  });
}

function buildTopic(overrides: Partial<ThemeTopicProps> = {}): ThemeTopic {
  return ThemeTopic.reconstitute({
    id: "topic-1",
    title: "Educação",
    color: "#2E7D32",
    createdAt: new Date("2026-08-01T00:00:00.000Z"),
    updatedAt: new Date("2026-08-01T00:00:00.000Z"),
    ...overrides,
  });
}

describe("ListThemes", () => {
  it("lists themes ordered by publication date, most recent first", async () => {
    const older = buildTheme({ id: "theme-1", enemYear: 2020 });
    const newer = buildTheme({ id: "theme-2", enemYear: 2023 });
    const noEnemYear = buildTheme({
      id: "theme-3",
      enemYear: null,
      createdAt: new Date("2026-08-05T00:00:00.000Z"),
    });
    const themeRepository = new InMemoryThemeRepository([older, newer, noEnemYear]);
    const themeTopicRepository = new InMemoryThemeTopicRepository([buildTopic()]);
    const listThemes = createListThemes({ themeRepository, themeTopicRepository });

    const result = await listThemes();

    expect(result.map(({ theme }) => theme.id)).toEqual(["theme-3", "theme-2", "theme-1"]);
  });

  it("filters by topicId", async () => {
    const matching = buildTheme({ id: "theme-1", topicId: "topic-a" });
    const other = buildTheme({ id: "theme-2", topicId: "topic-b" });
    const themeRepository = new InMemoryThemeRepository([matching, other]);
    const themeTopicRepository = new InMemoryThemeTopicRepository([
      buildTopic({ id: "topic-a" }),
      buildTopic({ id: "topic-b" }),
    ]);
    const listThemes = createListThemes({ themeRepository, themeTopicRepository });

    const result = await listThemes({ topicId: "topic-a" });

    expect(result.map(({ theme }) => theme.id)).toEqual(["theme-1"]);
  });

  it("filters by a substring of the title", async () => {
    const matching = buildTheme({ id: "theme-1", title: "Educação financeira no Brasil" });
    const other = buildTheme({ id: "theme-2", title: "Mobilidade urbana nas grandes cidades" });
    const themeRepository = new InMemoryThemeRepository([matching, other]);
    const themeTopicRepository = new InMemoryThemeTopicRepository([buildTopic()]);
    const listThemes = createListThemes({ themeRepository, themeTopicRepository });

    const result = await listThemes({ search: "financeira" });

    expect(result.map(({ theme }) => theme.id)).toEqual(["theme-1"]);
  });

  it("returns an empty list when there are no themes", async () => {
    const themeRepository = new InMemoryThemeRepository();
    const themeTopicRepository = new InMemoryThemeTopicRepository();
    const listThemes = createListThemes({ themeRepository, themeTopicRepository });

    const result = await listThemes();

    expect(result).toEqual([]);
  });

  it("resolves the topic (title/color) for each theme returned", async () => {
    const theme = buildTheme({ topicId: "topic-1" });
    const topic = buildTopic({ id: "topic-1", title: "Educação", color: "#2E7D32" });
    const themeRepository = new InMemoryThemeRepository([theme]);
    const themeTopicRepository = new InMemoryThemeTopicRepository([topic]);
    const listThemes = createListThemes({ themeRepository, themeTopicRepository });

    const result = await listThemes();

    expect(result).toEqual([
      {
        theme: { id: theme.id, title: theme.title, enemYear: theme.enemYear, topicId: theme.topicId },
        topic: { id: topic.id, title: topic.title, color: topic.color },
      },
    ]);
  });

  it("resolves the topic once per distinct topicId, even with repeated themes", async () => {
    const first = buildTheme({ id: "theme-1", topicId: "topic-1" });
    const second = buildTheme({ id: "theme-2", topicId: "topic-1" });
    const topic = buildTopic({ id: "topic-1" });
    const themeRepository = new InMemoryThemeRepository([first, second]);
    const themeTopicRepository = new InMemoryThemeTopicRepository([topic]);
    const findByIdsCalls: string[][] = [];
    const originalFindByIds = themeTopicRepository.findByIds.bind(themeTopicRepository);
    themeTopicRepository.findByIds = async (ids) => {
      findByIdsCalls.push(ids);
      return originalFindByIds(ids);
    };
    const listThemes = createListThemes({ themeRepository, themeTopicRepository });

    const result = await listThemes();

    const topicDTO = { id: topic.id, title: topic.title, color: topic.color };
    expect(findByIdsCalls).toEqual([["topic-1"]]);
    expect(result).toEqual([
      { theme: { id: second.id, title: second.title, enemYear: second.enemYear, topicId: second.topicId }, topic: topicDTO },
      { theme: { id: first.id, title: first.title, enemYear: first.enemYear, topicId: first.topicId }, topic: topicDTO },
    ]);
  });

  it("returns topic: null for a theme whose topic no longer exists", async () => {
    const theme = buildTheme({ topicId: "missing-topic" });
    const themeRepository = new InMemoryThemeRepository([theme]);
    const themeTopicRepository = new InMemoryThemeTopicRepository();
    const listThemes = createListThemes({ themeRepository, themeTopicRepository });

    const result = await listThemes();

    expect(result).toEqual([
      { theme: { id: theme.id, title: theme.title, enemYear: theme.enemYear, topicId: theme.topicId }, topic: null },
    ]);
  });
});
