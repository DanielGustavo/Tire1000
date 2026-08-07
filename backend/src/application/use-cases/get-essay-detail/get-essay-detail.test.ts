import { describe, expect, it } from "vitest";
import { Essay, type EssayProps } from "../../../domain/entities/essay.js";
import { EssayEvaluation, type EssayEvaluationScores } from "../../../domain/entities/essay-evaluation.js";
import { InMemoryEssayEvaluationRepository } from "../../../infra/repositories/fakes/in-memory-essay-evaluation-repository.js";
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

function buildScores(overrides: Partial<EssayEvaluationScores> = {}): EssayEvaluationScores {
  const defaultScore = { score: 160, evaluationText: "Bom domínio, com poucos desvios." };
  return { C1: defaultScore, C2: defaultScore, C3: defaultScore, C4: defaultScore, C5: defaultScore, final: { score: 800, evaluationText: "Parecer geral." }, ...overrides };
}

describe("GetEssayDetail", () => {
  it("returns the essay's DTO for its owner, with textContent and no evaluation before Avaliação finishes", async () => {
    const essayRepository = new InMemoryEssayRepository();
    await essayRepository.create(buildEssay());
    const getEssayDetail = createGetEssayDetail({ essayRepository, essayEvaluationRepository: new InMemoryEssayEvaluationRepository() });

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
        textContent: null,
        evaluation: null,
      },
    });
  });

  it("includes the evaluation's scores and highlights once Avaliação finished (SUCCESS)", async () => {
    const essayRepository = new InMemoryEssayRepository();
    await essayRepository.create(
      buildEssay({ status: "SUCCESS", finalScore: 800, textContent: "Era uma vez uma redação." }),
    );
    const essayEvaluationRepository = new InMemoryEssayEvaluationRepository();
    const scores = buildScores();
    await essayEvaluationRepository.create(
      EssayEvaluation.create({
        essayId: "essay-1",
        scores,
        highlights: [{ type: "C2", anchorIndex: 0, endIndex: 7, textContent: "Era uma" }],
      }),
    );
    const getEssayDetail = createGetEssayDetail({ essayRepository, essayEvaluationRepository });

    const result = await getEssayDetail({ userId: "user-1", essayId: "essay-1" });

    expect(result.essay.textContent).toBe("Era uma vez uma redação.");
    expect(result.essay.evaluation).toEqual({
      scores,
      highlights: [{ type: "C2", anchorIndex: 0, endIndex: 7, textContent: "Era uma" }],
    });
  });

  it("throws NotFoundError when the essay does not exist", async () => {
    const essayRepository = new InMemoryEssayRepository();
    const getEssayDetail = createGetEssayDetail({ essayRepository, essayEvaluationRepository: new InMemoryEssayEvaluationRepository() });

    await expect(getEssayDetail({ userId: "user-1", essayId: "missing-essay" })).rejects.toThrow(NotFoundError);
  });

  it("throws NotFoundError when the essay belongs to a different user", async () => {
    const essayRepository = new InMemoryEssayRepository();
    await essayRepository.create(buildEssay());
    const getEssayDetail = createGetEssayDetail({ essayRepository, essayEvaluationRepository: new InMemoryEssayEvaluationRepository() });

    await expect(getEssayDetail({ userId: "another-user", essayId: "essay-1" })).rejects.toThrow(NotFoundError);
  });
});
