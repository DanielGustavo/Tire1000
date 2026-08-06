import { describe, expect, it } from "vitest";
import { Theme, type ThemeProps } from "../../../domain/entities/theme.js";
import { InMemoryThemeRepository } from "../../../infra/repositories/fakes/in-memory-theme-repository.js";
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
    const listThemes = createListThemes({ themeRepository });

    const result = await listThemes();

    expect(result.map((theme) => theme.id)).toEqual(["theme-3", "theme-2", "theme-1"]);
  });

  it("filters by topicId", async () => {
    const matching = buildTheme({ id: "theme-1", topicId: "topic-a" });
    const other = buildTheme({ id: "theme-2", topicId: "topic-b" });
    const themeRepository = new InMemoryThemeRepository([matching, other]);
    const listThemes = createListThemes({ themeRepository });

    const result = await listThemes({ topicId: "topic-a" });

    expect(result.map((theme) => theme.id)).toEqual(["theme-1"]);
  });

  it("filters by a substring of the title", async () => {
    const matching = buildTheme({ id: "theme-1", title: "Educação financeira no Brasil" });
    const other = buildTheme({ id: "theme-2", title: "Mobilidade urbana nas grandes cidades" });
    const themeRepository = new InMemoryThemeRepository([matching, other]);
    const listThemes = createListThemes({ themeRepository });

    const result = await listThemes({ search: "financeira" });

    expect(result.map((theme) => theme.id)).toEqual(["theme-1"]);
  });

  it("returns an empty list when there are no themes", async () => {
    const themeRepository = new InMemoryThemeRepository();
    const listThemes = createListThemes({ themeRepository });

    const result = await listThemes();

    expect(result).toEqual([]);
  });
});
