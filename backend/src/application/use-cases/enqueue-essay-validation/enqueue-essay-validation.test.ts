import { describe, expect, it } from "vitest";
import { Essay, type EssayProps } from "../../../domain/entities/essay.js";
import { User } from "../../../domain/entities/user.js";
import { InMemoryEssayRepository } from "../../../infra/repositories/fakes/in-memory-essay-repository.js";
import { InMemoryUserRepository } from "../../../infra/repositories/fakes/in-memory-user-repository.js";
import { InMemoryEssayValidationQueueGateway } from "../../../infra/gateways/fakes/in-memory-essay-validation-queue-gateway.js";
import { createEnqueueEssayValidation } from "./enqueue-essay-validation.js";

function buildEssay(overrides: Partial<EssayProps> = {}): Essay {
  return Essay.reconstitute({
    id: "essay-1",
    status: "UPLOADING",
    validationAttempts: 0,
    rejectedAttempts: 0,
    rejectionReasons: [],
    fileKey: "essays/essay-1",
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

async function buildDeps({
  essay = buildEssay(),
  credits = 1,
}: { essay?: Essay | null; credits?: number } = {}) {
  const essayRepository = new InMemoryEssayRepository();
  if (essay) await essayRepository.create(essay);

  const userRepository = new InMemoryUserRepository();
  await userRepository.create(
    User.reconstitute({
      id: "user-1",
      externalId: "sub-1",
      email: "student@example.com",
      name: "Student",
      credits,
      createdAt: new Date("2026-08-01T00:00:00.000Z"),
      updatedAt: new Date("2026-08-01T00:00:00.000Z"),
    }),
  );

  return { essayRepository, userRepository, essayValidationQueueGateway: new InMemoryEssayValidationQueueGateway() };
}

describe("EnqueueEssayValidation", () => {
  it("moves the essay to QUEUED, debits 1 credit and enqueues it to the fila de Revisão", async () => {
    const deps = await buildDeps({ credits: 2 });
    const enqueueEssayValidation = createEnqueueEssayValidation(deps);

    const result = await enqueueEssayValidation({ fileKey: "essays/essay-1" });

    expect(result).toEqual({ enqueued: true });
    await expect(deps.essayRepository.findById("essay-1")).resolves.toMatchObject({ status: "QUEUED" });
    await expect(deps.userRepository.findById("user-1")).resolves.toMatchObject({ credits: 1 });
    expect(deps.essayValidationQueueGateway.enqueuedMessages).toEqual([{ essayId: "essay-1" }]);
  });

  it("is a no-op when the file key doesn't match the essays/ prefix", async () => {
    const deps = await buildDeps();
    const enqueueEssayValidation = createEnqueueEssayValidation(deps);

    const result = await enqueueEssayValidation({ fileKey: "other-bucket-prefix/essay-1" });

    expect(result).toEqual({ enqueued: false });
    expect(deps.essayValidationQueueGateway.enqueuedMessages).toEqual([]);
  });

  it("is a no-op when no essay matches the parsed id", async () => {
    const deps = await buildDeps({ essay: null });
    const enqueueEssayValidation = createEnqueueEssayValidation(deps);

    const result = await enqueueEssayValidation({ fileKey: "essays/missing-essay" });

    expect(result).toEqual({ enqueued: false });
    expect(deps.essayValidationQueueGateway.enqueuedMessages).toEqual([]);
  });

  it("is a no-op, without touching credits, when the essay is no longer UPLOADING (duplicate S3 event redelivery)", async () => {
    const deps = await buildDeps({ essay: buildEssay({ status: "QUEUED" }), credits: 1 });
    const enqueueEssayValidation = createEnqueueEssayValidation(deps);

    const result = await enqueueEssayValidation({ fileKey: "essays/essay-1" });

    expect(result).toEqual({ enqueued: false });
    expect(deps.essayValidationQueueGateway.enqueuedMessages).toEqual([]);
    await expect(deps.userRepository.findById("user-1")).resolves.toMatchObject({ credits: 1 });
  });

  it("marks the essay UPLOAD_FAILED and does not enqueue when the user doesn't have enough credits", async () => {
    const deps = await buildDeps({ credits: 0 });
    const enqueueEssayValidation = createEnqueueEssayValidation(deps);

    const result = await enqueueEssayValidation({ fileKey: "essays/essay-1" });

    expect(result).toEqual({ enqueued: false });
    await expect(deps.essayRepository.findById("essay-1")).resolves.toMatchObject({ status: "UPLOAD_FAILED" });
    await expect(deps.userRepository.findById("user-1")).resolves.toMatchObject({ credits: 0 });
    expect(deps.essayValidationQueueGateway.enqueuedMessages).toEqual([]);
  });
});
