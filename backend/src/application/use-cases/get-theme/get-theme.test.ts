import { describe, expect, it } from "vitest";
import { Theme, type ThemeProps } from "../../../domain/entities/theme.js";
import { ReferenceText, type ReferenceTextProps } from "../../../domain/entities/reference-text.js";
import { NotFoundError } from "../../../shared/errors/not-found-error.js";
import { InMemoryThemeRepository } from "../../../infra/repositories/fakes/in-memory-theme-repository.js";
import { InMemoryReferenceTextRepository } from "../../../infra/repositories/fakes/in-memory-reference-text-repository.js";
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

describe("GetTheme", () => {
  it("returns the theme with its reference texts", async () => {
    const theme = buildTheme();
    const referenceText = buildReferenceText();
    const themeRepository = new InMemoryThemeRepository([theme]);
    const referenceTextRepository = new InMemoryReferenceTextRepository([referenceText]);
    const getTheme = createGetTheme({ themeRepository, referenceTextRepository });

    const result = await getTheme({ themeId: "theme-1" });

    expect(result).toEqual({ theme, referenceTexts: [referenceText] });
  });

  it("returns an empty reference text list when the theme has none", async () => {
    const theme = buildTheme();
    const themeRepository = new InMemoryThemeRepository([theme]);
    const referenceTextRepository = new InMemoryReferenceTextRepository();
    const getTheme = createGetTheme({ themeRepository, referenceTextRepository });

    const result = await getTheme({ themeId: "theme-1" });

    expect(result.referenceTexts).toEqual([]);
  });

  it("throws NotFoundError when the theme does not exist", async () => {
    const themeRepository = new InMemoryThemeRepository();
    const referenceTextRepository = new InMemoryReferenceTextRepository();
    const getTheme = createGetTheme({ themeRepository, referenceTextRepository });

    await expect(getTheme({ themeId: "missing-theme" })).rejects.toThrow(NotFoundError);
  });
});
