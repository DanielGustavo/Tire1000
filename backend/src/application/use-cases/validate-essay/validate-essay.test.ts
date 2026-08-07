import { describe, expect, it } from "vitest";
import { Essay, type EssayProps } from "../../../domain/entities/essay.js";
import { User } from "../../../domain/entities/user.js";
import { InMemoryEssayCostRepository } from "../../../infra/repositories/fakes/in-memory-essay-cost-repository.js";
import { InMemoryEssayRepository } from "../../../infra/repositories/fakes/in-memory-essay-repository.js";
import { InMemoryUserRepository } from "../../../infra/repositories/fakes/in-memory-user-repository.js";
import { InMemoryDevAlertGateway } from "../../../infra/gateways/fakes/in-memory-dev-alert-gateway.js";
import { InMemoryEssayEvaluationQueueGateway } from "../../../infra/gateways/fakes/in-memory-essay-evaluation-queue-gateway.js";
import { InMemoryEssayStorageGateway } from "../../../infra/gateways/fakes/in-memory-essay-storage-gateway.js";
import { InMemoryEssayValidationGateway } from "../../../infra/gateways/fakes/in-memory-essay-validation-gateway.js";
import { SequentialIdGenerator } from "../../../infra/gateways/fakes/sequential-id-generator.js";
import { createValidateEssay } from "./validate-essay.js";

function buildEssay(overrides: Partial<EssayProps> = {}): Essay {
  return Essay.reconstitute({
    id: "essay-1",
    status: "QUEUED",
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
    createdAt: new Date("2026-08-01T00:00:00.000Z"),
    updatedAt: new Date("2026-08-01T00:00:00.000Z"),
    ...overrides,
  });
}

async function buildDeps({ essay = buildEssay(), credits = 0 }: { essay?: Essay | null; credits?: number } = {}) {
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

  return {
    essayRepository,
    userRepository,
    essayCostRepository: new InMemoryEssayCostRepository(),
    essayStorageGateway: new InMemoryEssayStorageGateway(),
    essayValidationGateway: new InMemoryEssayValidationGateway(),
    essayEvaluationQueueGateway: new InMemoryEssayEvaluationQueueGateway(),
    devAlertGateway: new InMemoryDevAlertGateway(),
    idGenerator: new SequentialIdGenerator(),
  };
}

describe("ValidateEssay", () => {
  describe("success", () => {
    it("approves the essay: text saved, photo deleted, cost recorded, enqueued to the fila de Avaliação", async () => {
      const deps = await buildDeps();
      deps.essayValidationGateway.queueApproved({ textContent: "Era uma vez...", tokens: 250, amountInCents: 2.5 });
      const validateEssay = createValidateEssay(deps);

      const result = await validateEssay({ essayId: "essay-1" });

      expect(result).toEqual({ outcome: "APPROVED" });
      await expect(deps.essayRepository.findById("essay-1")).resolves.toMatchObject({
        status: "VALIDATED",
        textContent: "Era uma vez...",
        fileKey: null,
        validationAttempts: 1,
      });
      expect(deps.essayStorageGateway.deletedKeys).toEqual(["essays/essay-1"]);
      expect(deps.essayEvaluationQueueGateway.enqueuedMessages).toEqual([{ essayId: "essay-1" }]);
      expect(deps.essayCostRepository.created).toMatchObject([
        { essayId: "essay-1", userId: "user-1", step: "VALIDATION", tokens: 250, amountInCents: 2.5 },
      ]);
    });

    it("does not touch the user's credits — the debit already happened at EnqueueEssayValidation (ADR-0011)", async () => {
      const deps = await buildDeps({ credits: 3 });
      deps.essayValidationGateway.queueApproved();
      const validateEssay = createValidateEssay(deps);

      await validateEssay({ essayId: "essay-1" });

      await expect(deps.userRepository.findById("user-1")).resolves.toMatchObject({ credits: 3 });
    });

    it("fetches the photo bytes from storage and passes them to Gemini", async () => {
      const deps = await buildDeps();
      deps.essayStorageGateway.objectsByKey.set("essays/essay-1", Buffer.from("fake-jpeg-bytes"));
      deps.essayValidationGateway.queueApproved();
      const validateEssay = createValidateEssay(deps);

      await validateEssay({ essayId: "essay-1" });

      expect(deps.essayValidationGateway.calls).toEqual([Buffer.from("fake-jpeg-bytes")]);
    });

    it("clears rejectionReasons left over from a previous REJECTED cycle once a resend is approved", async () => {
      const deps = await buildDeps({ essay: buildEssay({ rejectionReasons: ["LOW_LIGHTING"] }) });
      deps.essayValidationGateway.queueApproved();
      const validateEssay = createValidateEssay(deps);

      await validateEssay({ essayId: "essay-1" });

      await expect(deps.essayRepository.findById("essay-1")).resolves.toMatchObject({ rejectionReasons: [] });
    });
  });

  describe("rejection", () => {
    it("rejects the essay: attempts reset, reasons saved, photo deleted, credit refunded", async () => {
      const deps = await buildDeps({ essay: buildEssay({ rejectedAttempts: 2 }), credits: 0 });
      deps.essayValidationGateway.queueRejected({ reasons: ["LOW_LIGHTING", "TOO_FEW_LINES"] });
      const validateEssay = createValidateEssay(deps);

      const result = await validateEssay({ essayId: "essay-1" });

      expect(result).toEqual({ outcome: "REJECTED" });
      await expect(deps.essayRepository.findById("essay-1")).resolves.toMatchObject({
        status: "REJECTED",
        rejectedAttempts: 3,
        validationAttempts: 0,
        rejectionReasons: ["LOW_LIGHTING", "TOO_FEW_LINES"],
        fileKey: null,
      });
      expect(deps.essayStorageGateway.deletedKeys).toEqual(["essays/essay-1"]);
      await expect(deps.userRepository.findById("user-1")).resolves.toMatchObject({ credits: 1 });
      expect(deps.essayEvaluationQueueGateway.enqueuedMessages).toEqual([]);
    });

    it("alerts the dev once rejectedAttempts passes the threshold of 10, without any other action", async () => {
      const deps = await buildDeps({ essay: buildEssay({ rejectedAttempts: 10 }) });
      deps.essayValidationGateway.queueRejected();
      const validateEssay = createValidateEssay(deps);

      await validateEssay({ essayId: "essay-1" });

      expect(deps.devAlertGateway.alerts).toMatchObject([{ subject: "Usuário com muitas redações rejeitadas na Revisão" }]);
    });

    it("does not alert the dev when rejectedAttempts is at or below the threshold", async () => {
      const deps = await buildDeps({ essay: buildEssay({ rejectedAttempts: 9 }) });
      deps.essayValidationGateway.queueRejected();
      const validateEssay = createValidateEssay(deps);

      await validateEssay({ essayId: "essay-1" });

      expect(deps.devAlertGateway.alerts).toEqual([]);
    });
  });

  describe("system failure", () => {
    it("retries transparently on the 1st and 2nd failed attempts — no refund, no alert, error rethrown", async () => {
      const deps = await buildDeps();
      deps.essayValidationGateway.queueFailure();
      const validateEssay = createValidateEssay(deps);

      await expect(validateEssay({ essayId: "essay-1" })).rejects.toThrow("Gemini indisponível");

      await expect(deps.essayRepository.findById("essay-1")).resolves.toMatchObject({
        status: "VALIDATING",
        validationAttempts: 1,
      });
      expect(deps.devAlertGateway.alerts).toEqual([]);
      await expect(deps.userRepository.findById("user-1")).resolves.toMatchObject({ credits: 0 });

      // 2nd delivery of the same SQS message — essay is now VALIDATING, not QUEUED.
      deps.essayValidationGateway.queueFailure();
      await expect(validateEssay({ essayId: "essay-1" })).rejects.toThrow("Gemini indisponível");
      await expect(deps.essayRepository.findById("essay-1")).resolves.toMatchObject({
        status: "VALIDATING",
        validationAttempts: 2,
      });
      expect(deps.devAlertGateway.alerts).toEqual([]);
    });

    it("on the 3rd failed attempt, marks VALIDATION_FAILED, refunds the credit, alerts the dev, and still rethrows (so SQS also moves it to the DLQ)", async () => {
      const deps = await buildDeps({ essay: buildEssay({ status: "VALIDATING", validationAttempts: 2 }), credits: 0 });
      deps.essayValidationGateway.queueFailure(new Error("timeout"));
      const validateEssay = createValidateEssay(deps);

      await expect(validateEssay({ essayId: "essay-1" })).rejects.toThrow("timeout");

      await expect(deps.essayRepository.findById("essay-1")).resolves.toMatchObject({
        status: "VALIDATION_FAILED",
        validationAttempts: 0,
        fileKey: null,
      });
      expect(deps.essayStorageGateway.deletedKeys).toEqual(["essays/essay-1"]);
      await expect(deps.userRepository.findById("user-1")).resolves.toMatchObject({ credits: 1 });
      expect(deps.devAlertGateway.alerts).toMatchObject([{ subject: "Falha de sistema na Revisão" }]);
    });

    it("clears rejectionReasons left over from a previous REJECTED cycle once a resend terminally fails", async () => {
      const deps = await buildDeps({
        essay: buildEssay({ status: "VALIDATING", validationAttempts: 2, rejectionReasons: ["TOO_FEW_LINES"] }),
      });
      deps.essayValidationGateway.queueFailure(new Error("timeout"));
      const validateEssay = createValidateEssay(deps);

      await expect(validateEssay({ essayId: "essay-1" })).rejects.toThrow("timeout");

      await expect(deps.essayRepository.findById("essay-1")).resolves.toMatchObject({ rejectionReasons: [] });
    });
  });

  describe("no-op guards", () => {
    it("is a no-op when the essay doesn't exist", async () => {
      const deps = await buildDeps({ essay: null });
      const validateEssay = createValidateEssay(deps);

      await expect(validateEssay({ essayId: "missing-essay" })).resolves.toEqual({ outcome: "SKIPPED" });
    });

    it.each(["VALIDATED", "REJECTED", "UPLOADING"] as const)(
      "is a no-op when the essay is already %s (duplicate SQS delivery after this essay's Revisão finished)",
      async (status) => {
        const deps = await buildDeps({ essay: buildEssay({ status, fileKey: status === "UPLOADING" ? "essays/essay-1" : null }) });
        const validateEssay = createValidateEssay(deps);

        const result = await validateEssay({ essayId: "essay-1" });

        expect(result).toEqual({ outcome: "SKIPPED" });
        expect(deps.essayValidationGateway.calls).toEqual([]);
      },
    );

    it("is a no-op for a VALIDATION_FAILED essay — passes the REVALIDATABLE_ESSAY_STATUSES gate but has no fileKey left to reprocess (see its doc comment)", async () => {
      const deps = await buildDeps({ essay: buildEssay({ status: "VALIDATION_FAILED", fileKey: null }) });
      const validateEssay = createValidateEssay(deps);

      const result = await validateEssay({ essayId: "essay-1" });

      expect(result).toEqual({ outcome: "SKIPPED" });
      expect(deps.essayValidationGateway.calls).toEqual([]);
    });
  });
});
