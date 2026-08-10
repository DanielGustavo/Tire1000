import { describe, expect, it } from "vitest";
import { Essay, type EssayProps } from "../../../domain/entities/essay.js";
import { InMemoryEssayRepository } from "../../../infra/repositories/fakes/in-memory-essay-repository.js";
import { createListUserEssays } from "./list-user-essays.js";

function buildEssay(overrides: Partial<EssayProps> = {}): Essay {
  return Essay.reconstitute({
    id: "essay-1",
    status: "SUCCESS",
    validationAttempts: 1,
    rejectedAttempts: 0,
    rejectionReasons: [],
    fileKey: null,
    textContent: "Texto da redação.",
    evaluationAttempts: 1,
    finalScore: 800,
    userId: "user-1",
    themeId: "theme-1",
    themeTitle: "A importância da educação financeira no Brasil",
    topicColor: "#2E7D32",
    enemYear: 2023,
    topicTitle: "Educação",
    createdAt: new Date("2026-08-01T00:00:00.000Z"),
    updatedAt: new Date("2026-08-01T00:00:00.000Z"),
    ...overrides,
  });
}

describe("ListUserEssays", () => {
  it("lists only the given user's essays, most recently submitted first", async () => {
    const essayRepository = new InMemoryEssayRepository();
    await essayRepository.create(buildEssay({ id: "1zzz1", userId: "user-1" }));
    await essayRepository.create(buildEssay({ id: "1zzz3", userId: "user-1" }));
    await essayRepository.create(buildEssay({ id: "1zzz2", userId: "user-1" }));
    await essayRepository.create(buildEssay({ id: "1zzz9", userId: "user-2" }));
    const listUserEssays = createListUserEssays({ essayRepository });

    const result = await listUserEssays({ userId: "user-1" });

    expect(result.essays.map((essay) => essay.id)).toEqual(["1zzz3", "1zzz2", "1zzz1"]);
  });

  it("returns the list DTO shape — no textContent/evaluation leaked into the history list", async () => {
    const essayRepository = new InMemoryEssayRepository();
    await essayRepository.create(buildEssay());
    const listUserEssays = createListUserEssays({ essayRepository });

    const result = await listUserEssays({ userId: "user-1" });

    expect(result.essays).toEqual([
      {
        id: "essay-1",
        status: "SUCCESS",
        rejectionReasons: [],
        themeId: "theme-1",
        themeTitle: "A importância da educação financeira no Brasil",
        topicColor: "#2E7D32",
        enemYear: 2023,
        topicTitle: "Educação",
        finalScore: 800,
        createdAt: "2026-08-01T00:00:00.000Z",
      },
    ]);
  });

  it("passes through null enemYear/topicTitle for essays created before the denormalization shipped", async () => {
    const essayRepository = new InMemoryEssayRepository();
    await essayRepository.create(buildEssay({ enemYear: null, topicTitle: null }));
    const listUserEssays = createListUserEssays({ essayRepository });

    const result = await listUserEssays({ userId: "user-1" });

    expect(result.essays[0]).toMatchObject({ enemYear: null, topicTitle: null });
  });

  it("returns an empty list when the user has no essays", async () => {
    const essayRepository = new InMemoryEssayRepository();
    const listUserEssays = createListUserEssays({ essayRepository });

    const result = await listUserEssays({ userId: "user-1" });

    expect(result.essays).toEqual([]);
  });

  it("caps a page at 5 essays and returns a nextCursor when more exist", async () => {
    const essayRepository = new InMemoryEssayRepository();
    const ids = ["1zzz1", "1zzz2", "1zzz3", "1zzz4", "1zzz5", "1zzz6"];
    for (const id of ids) {
      await essayRepository.create(buildEssay({ id, userId: "user-1" }));
    }
    const listUserEssays = createListUserEssays({ essayRepository });

    const result = await listUserEssays({ userId: "user-1" });

    expect(result.essays.map((essay) => essay.id)).toEqual(["1zzz6", "1zzz5", "1zzz4", "1zzz3", "1zzz2"]);
    expect(result.nextCursor).toBeDefined();
  });

  it("resumes from the given cursor and omits nextCursor once the last page is reached", async () => {
    const essayRepository = new InMemoryEssayRepository();
    const ids = ["1zzz1", "1zzz2", "1zzz3", "1zzz4", "1zzz5", "1zzz6"];
    for (const id of ids) {
      await essayRepository.create(buildEssay({ id, userId: "user-1" }));
    }
    const listUserEssays = createListUserEssays({ essayRepository });
    const firstPage = await listUserEssays({ userId: "user-1" });

    const secondPage = await listUserEssays({ userId: "user-1", cursor: firstPage.nextCursor });

    expect(secondPage.essays.map((essay) => essay.id)).toEqual(["1zzz1"]);
    expect(secondPage.nextCursor).toBeUndefined();
  });
});
