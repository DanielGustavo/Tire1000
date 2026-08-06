import { describe, expect, it } from "vitest";
import { Theme, type ThemeProps } from "../../../domain/entities/theme.js";
import { ThemeTopic, type ThemeTopicProps } from "../../../domain/entities/theme-topic.js";
import { User } from "../../../domain/entities/user.js";
import { InMemoryEssayRepository } from "../../../infra/repositories/fakes/in-memory-essay-repository.js";
import { InMemoryThemeRepository } from "../../../infra/repositories/fakes/in-memory-theme-repository.js";
import { InMemoryThemeTopicRepository } from "../../../infra/repositories/fakes/in-memory-theme-topic-repository.js";
import { InMemoryUserRepository } from "../../../infra/repositories/fakes/in-memory-user-repository.js";
import { InMemoryEssayStorageGateway } from "../../../infra/gateways/fakes/in-memory-essay-storage-gateway.js";
import { SequentialIdGenerator } from "../../../infra/gateways/fakes/sequential-id-generator.js";
import { InsufficientCreditsError } from "../../../shared/errors/insufficient-credits-error.js";
import { NotFoundError } from "../../../shared/errors/not-found-error.js";
import { createUploadEssay } from "./upload-essay.js";

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

async function buildDeps({ credits = 1 }: { credits?: number } = {}) {
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

  const themeRepository = new InMemoryThemeRepository([buildTheme()]);
  const themeTopicRepository = new InMemoryThemeTopicRepository([buildTopic()]);

  return {
    userRepository,
    themeRepository,
    themeTopicRepository,
    essayRepository: new InMemoryEssayRepository(),
    essayStorageGateway: new InMemoryEssayStorageGateway(),
    idGenerator: new SequentialIdGenerator(),
  };
}

describe("UploadEssay", () => {
  it("creates an Essay with status UPLOADING, denormalizing theme title and topic color", async () => {
    const deps = await buildDeps();
    const uploadEssay = createUploadEssay(deps);

    const result = await uploadEssay({ userId: "user-1", themeId: "theme-1" });

    expect(result.essayId).toBe("fake-id-1");
    const essay = await deps.essayRepository.findById("fake-id-1");
    expect(essay).toMatchObject({
      id: "fake-id-1",
      status: "UPLOADING",
      userId: "user-1",
      themeId: "theme-1",
      themeTitle: "A importância da educação financeira no Brasil",
      topicColor: "#2E7D32",
      fileKey: "essays/fake-id-1",
    });
  });

  it("requests a presigned upload capped at 10MB for the essay's file key", async () => {
    const deps = await buildDeps();
    const uploadEssay = createUploadEssay(deps);

    const result = await uploadEssay({ userId: "user-1", themeId: "theme-1" });

    expect(deps.essayStorageGateway.createdUploads).toEqual([
      { key: "essays/fake-id-1", maxSizeInBytes: 10 * 1024 * 1024 },
    ]);
    expect(result.upload).toEqual({ url: "https://s3.test/essays/fake-id-1", fields: { key: "essays/fake-id-1" } });
  });

  it("throws InsufficientCreditsError when the user has no credits", async () => {
    const deps = await buildDeps({ credits: 0 });
    const uploadEssay = createUploadEssay(deps);

    await expect(uploadEssay({ userId: "user-1", themeId: "theme-1" })).rejects.toThrow(InsufficientCreditsError);
    expect(deps.essayStorageGateway.createdUploads).toEqual([]);
  });

  it("throws NotFoundError when the user does not exist", async () => {
    const deps = await buildDeps();
    const uploadEssay = createUploadEssay(deps);

    await expect(uploadEssay({ userId: "missing-user", themeId: "theme-1" })).rejects.toThrow(NotFoundError);
  });

  it("throws NotFoundError when the theme does not exist", async () => {
    const deps = await buildDeps();
    const uploadEssay = createUploadEssay(deps);

    await expect(uploadEssay({ userId: "user-1", themeId: "missing-theme" })).rejects.toThrow(NotFoundError);
  });

  it("throws NotFoundError when the theme's topic no longer exists", async () => {
    const deps = await buildDeps();
    deps.themeTopicRepository = new InMemoryThemeTopicRepository();
    const uploadEssay = createUploadEssay(deps);

    await expect(uploadEssay({ userId: "user-1", themeId: "theme-1" })).rejects.toThrow(NotFoundError);
  });
});
