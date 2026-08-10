import { describe, expect, it } from "vitest";
import { Essay, type EssayProps, type EssayStatus } from "../../../domain/entities/essay.js";
import { User } from "../../../domain/entities/user.js";
import { InMemoryEssayRepository } from "../../../infra/repositories/fakes/in-memory-essay-repository.js";
import { InMemoryUserRepository } from "../../../infra/repositories/fakes/in-memory-user-repository.js";
import { InMemoryEssayStorageGateway } from "../../../infra/gateways/fakes/in-memory-essay-storage-gateway.js";
import { ConflictError } from "../../../shared/errors/conflict-error.js";
import { InsufficientCreditsError } from "../../../shared/errors/insufficient-credits-error.js";
import { NotFoundError } from "../../../shared/errors/not-found-error.js";
import { createResendEssay } from "./resend-essay.js";

function buildEssay(overrides: Partial<EssayProps> = {}): Essay {
  return Essay.reconstitute({
    id: "essay-1",
    status: "REJECTED",
    validationAttempts: 0,
    rejectedAttempts: 1,
    rejectionReasons: ["Letra ilegível"],
    fileKey: null,
    textContent: null,
    evaluationAttempts: 0,
    finalScore: null,
    userId: "user-1",
    themeId: "theme-1",
    themeTitle: "A importância da educação financeira no Brasil",
    topicColor: "#2E7D32",
    enemYear: null,
    topicTitle: null,
    createdAt: new Date("2026-08-01T00:00:00.000Z"),
    updatedAt: new Date("2026-08-01T00:00:00.000Z"),
    ...overrides,
  });
}

async function buildDeps({ credits = 1, essay = buildEssay() }: { credits?: number; essay?: Essay } = {}) {
  const userRepository = new InMemoryUserRepository();
  const user = User.reconstitute({
    id: "user-1",
    externalId: "sub-1",
    email: "student@example.com",
    name: "Student",
    credits,
    createdAt: new Date("2026-08-01T00:00:00.000Z"),
    updatedAt: new Date("2026-08-01T00:00:00.000Z"),
  });
  await userRepository.create(user);

  const essayRepository = new InMemoryEssayRepository();
  await essayRepository.create(essay);

  return {
    userRepository,
    essayRepository,
    essayStorageGateway: new InMemoryEssayStorageGateway(),
  };
}

describe("ResendEssay", () => {
  it("resets a REJECTED essay back to UPLOADING with a fresh presigned upload", async () => {
    const deps = await buildDeps();
    const resendEssay = createResendEssay(deps);

    const result = await resendEssay({ userId: "user-1", essayId: "essay-1" });

    expect(result).toEqual({
      essayId: "essay-1",
      upload: { url: "https://s3.test/essays/essay-1", fields: { key: "essays/essay-1" } },
    });
    const essay = await deps.essayRepository.findById("essay-1");
    expect(essay).toMatchObject({ status: "UPLOADING", fileKey: "essays/essay-1", textContent: null });
  });

  it("keeps rejectedAttempts untouched — it's a lifetime counter, not per-attempt state", async () => {
    const deps = await buildDeps({ essay: buildEssay({ rejectedAttempts: 4 }) });
    const resendEssay = createResendEssay(deps);

    await resendEssay({ userId: "user-1", essayId: "essay-1" });

    const essay = await deps.essayRepository.findById("essay-1");
    expect(essay?.rejectedAttempts).toBe(4);
  });

  it("allows resend from UPLOADING (an abandoned upload attempt)", async () => {
    const deps = await buildDeps({ essay: buildEssay({ status: "UPLOADING", rejectionReasons: [] }) });
    const resendEssay = createResendEssay(deps);

    await expect(resendEssay({ userId: "user-1", essayId: "essay-1" })).resolves.toMatchObject({ essayId: "essay-1" });
  });

  it("allows resend from UPLOAD_FAILED (the credit debit lost the race at confirmation time)", async () => {
    const deps = await buildDeps({ essay: buildEssay({ status: "UPLOAD_FAILED", rejectionReasons: [] }) });
    const resendEssay = createResendEssay(deps);

    await expect(resendEssay({ userId: "user-1", essayId: "essay-1" })).resolves.toMatchObject({ essayId: "essay-1" });
  });

  it("allows resend from VALIDATION_FAILED (system error during Revisão, credit already refunded)", async () => {
    const deps = await buildDeps({ essay: buildEssay({ status: "VALIDATION_FAILED", rejectionReasons: [] }) });
    const resendEssay = createResendEssay(deps);

    await expect(resendEssay({ userId: "user-1", essayId: "essay-1" })).resolves.toMatchObject({ essayId: "essay-1" });
  });

  it.each<EssayStatus>(["QUEUED", "VALIDATING", "VALIDATED", "EVALUATING", "EVALUATION_FAILED", "SUCCESS"])(
    "throws ConflictError when the essay is %s",
    async (status) => {
      const deps = await buildDeps({ essay: buildEssay({ status }) });
      const resendEssay = createResendEssay(deps);

      await expect(resendEssay({ userId: "user-1", essayId: "essay-1" })).rejects.toThrow(ConflictError);
      expect(deps.essayStorageGateway.createdUploads).toEqual([]);
    },
  );

  it("throws InsufficientCreditsError when the user has no credits", async () => {
    const deps = await buildDeps({ credits: 0 });
    const resendEssay = createResendEssay(deps);

    await expect(resendEssay({ userId: "user-1", essayId: "essay-1" })).rejects.toThrow(InsufficientCreditsError);
    expect(deps.essayStorageGateway.createdUploads).toEqual([]);
  });

  it("throws NotFoundError when the essay does not exist", async () => {
    const deps = await buildDeps();
    const resendEssay = createResendEssay(deps);

    await expect(resendEssay({ userId: "user-1", essayId: "missing-essay" })).rejects.toThrow(NotFoundError);
  });

  it("throws NotFoundError when the essay belongs to a different user", async () => {
    const deps = await buildDeps();
    const resendEssay = createResendEssay(deps);

    await expect(resendEssay({ userId: "another-user", essayId: "essay-1" })).rejects.toThrow(NotFoundError);
  });
});
