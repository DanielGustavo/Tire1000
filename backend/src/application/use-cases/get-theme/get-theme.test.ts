import { describe, expect, it } from "vitest";
import { Theme, type ThemeProps } from "../../../domain/entities/theme.js";
import { ReferenceText, type ReferenceTextProps } from "../../../domain/entities/reference-text.js";
import { ThemeTopic, type ThemeTopicProps } from "../../../domain/entities/theme-topic.js";
import { NotFoundError } from "../../../shared/errors/not-found-error.js";
import { InMemoryThemeRepository } from "../../../infra/repositories/fakes/in-memory-theme-repository.js";
import { InMemoryThemeTopicRepository } from "../../../infra/repositories/fakes/in-memory-theme-topic-repository.js";
import { createGetTheme } from "./get-theme.js";

function buildTheme(overrides: Partial<ThemeProps> = {}): Theme {
  return Theme.reconstitute({
    id: "theme-1",
    title: "A importância da educação financeira no Brasil",
    enemYear: 2023,
    topicId: "topic-1",
    createdAt: new Date("2026-08-01T00:00:00.000Z"),
    updatedAt: new Date("2026-08-01T00:00:00.000Z"),
    ...overrides,
  });
}

function buildReferenceText(overrides: Partial<ReferenceTextProps> = {}): ReferenceText {
  return ReferenceText.reconstitute({
    id: "reference-1",
    title: "Texto motivador 1",
    font: "serif",
    paragraphs: [{ type: "TEXT", content: "Lorem ipsum dolor sit amet." }],
    themeId: "theme-1",
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

describe("GetTheme", () => {
  it("returns the theme with its reference texts and topic", async () => {
    const theme = buildTheme();
    const referenceText = buildReferenceText();
    const topic = buildTopic();
    const themeRepository = new InMemoryThemeRepository([theme], [referenceText]);
    const themeTopicRepository = new InMemoryThemeTopicRepository([topic]);
    const getTheme = createGetTheme({ themeRepository, themeTopicRepository, themeAssetsBaseUrl: "https://assets.tire1000.com" });

    const result = await getTheme({ themeId: "theme-1" });

    expect(result).toEqual({
      theme: { id: theme.id, title: theme.title, enemYear: theme.enemYear, topicId: theme.topicId },
      referenceTexts: [
        {
          id: referenceText.id,
          title: referenceText.title,
          font: referenceText.font,
          themeId: referenceText.themeId,
          paragraphs: referenceText.paragraphs,
        },
      ],
      topic: { id: topic.id, title: topic.title, color: topic.color },
    });
  });

  it("turns an IMAGE paragraph's fileKey into a URL under themeAssetsBaseUrl", async () => {
    const theme = buildTheme();
    const referenceText = buildReferenceText({
      paragraphs: [{ type: "IMAGE", content: { fileKey: "seed/mapa.png", font: "sans-serif" } }],
    });
    const themeRepository = new InMemoryThemeRepository([theme], [referenceText]);
    const themeTopicRepository = new InMemoryThemeTopicRepository([buildTopic()]);
    const getTheme = createGetTheme({ themeRepository, themeTopicRepository, themeAssetsBaseUrl: "https://assets.tire1000.com" });

    const result = await getTheme({ themeId: "theme-1" });

    expect(result.referenceTexts[0]!.paragraphs).toEqual([
      { type: "IMAGE", content: { url: "https://assets.tire1000.com/seed/mapa.png", font: "sans-serif" } },
    ]);
  });

  it("returns an empty reference text list when the theme has none", async () => {
    const theme = buildTheme();
    const themeRepository = new InMemoryThemeRepository([theme]);
    const themeTopicRepository = new InMemoryThemeTopicRepository([buildTopic()]);
    const getTheme = createGetTheme({ themeRepository, themeTopicRepository, themeAssetsBaseUrl: "https://assets.tire1000.com" });

    const result = await getTheme({ themeId: "theme-1" });

    expect(result.referenceTexts).toEqual([]);
  });

  it("returns topic: null when the theme's topic no longer exists", async () => {
    const theme = buildTheme();
    const themeRepository = new InMemoryThemeRepository([theme]);
    const themeTopicRepository = new InMemoryThemeTopicRepository();
    const getTheme = createGetTheme({ themeRepository, themeTopicRepository, themeAssetsBaseUrl: "https://assets.tire1000.com" });

    const result = await getTheme({ themeId: "theme-1" });

    expect(result.topic).toBeNull();
  });

  it("throws NotFoundError when the theme does not exist", async () => {
    const themeRepository = new InMemoryThemeRepository();
    const themeTopicRepository = new InMemoryThemeTopicRepository();
    const getTheme = createGetTheme({ themeRepository, themeTopicRepository, themeAssetsBaseUrl: "https://assets.tire1000.com" });

    await expect(getTheme({ themeId: "missing-theme" })).rejects.toThrow(NotFoundError);
  });
});
