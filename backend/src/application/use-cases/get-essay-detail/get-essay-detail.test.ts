import { describe, expect, it } from "vitest";
import { Essay, type EssayProps } from "../../../domain/entities/essay.js";
import { InMemoryEssayRepository } from "../../../infra/repositories/fakes/in-memory-essay-repository.js";
import { NotFoundError } from "../../../shared/errors/not-found-error.js";
import { createGetEssayDetail } from "./get-essay-detail.js";

function buildEssay(overrides: Partial<EssayProps> = {}): Essay {
  return Essay.reconstitute({
    id: "essay-1",
    status: "REJECTED",
    validationAttempts: 0,
    rejectedAttempts: 1,
    rejectionReasons: ["LOW_LIGHTING"],
    fileKey: null,
    textContent: null,
    evaluationAttempts: 0,
    finalScore: null,
    userId: "user-1",
    themeId: "theme-1",
    themeTitle: "A importância da educação financeira no Brasil",
    topicColor: "#2E7D32",
    createdAt: new Date("2026-08-01T00:00:00.000Z"),
    updatedAt: new Date("2026-08-01T00:00:00.000Z"),
    ...overrides,
  });
}

describe("GetEssayDetail", () => {
  it("returns the essay's DTO for its owner", async () => {
    const essayRepository = new InMemoryEssayRepository();
    await essayRepository.create(buildEssay());
    const getEssayDetail = createGetEssayDetail({ essayRepository });

    const result = await getEssayDetail({ userId: "user-1", essayId: "essay-1" });

    expect(result).toEqual({
      essay: {
        id: "essay-1",
        status: "REJECTED",
        rejectionReasons: ["LOW_LIGHTING"],
        themeId: "theme-1",
        themeTitle: "A importância da educação financeira no Brasil",
        topicColor: "#2E7D32",
        createdAt: "2026-08-01T00:00:00.000Z",
      },
    });
  });

  it("throws NotFoundError when the essay does not exist", async () => {
    const essayRepository = new InMemoryEssayRepository();
    const getEssayDetail = createGetEssayDetail({ essayRepository });

    await expect(getEssayDetail({ userId: "user-1", essayId: "missing-essay" })).rejects.toThrow(NotFoundError);
  });

  it("throws NotFoundError when the essay belongs to a different user", async () => {
    const essayRepository = new InMemoryEssayRepository();
    await essayRepository.create(buildEssay());
    const getEssayDetail = createGetEssayDetail({ essayRepository });

    await expect(getEssayDetail({ userId: "another-user", essayId: "essay-1" })).rejects.toThrow(NotFoundError);
  });
});
