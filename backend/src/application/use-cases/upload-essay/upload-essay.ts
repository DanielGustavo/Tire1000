import { Essay, essayFileKey, ESSAY_PHOTO_MAX_SIZE_IN_BYTES } from "../../../domain/entities/essay.js";
import type { EssayStorageGateway, PresignedUpload } from "../../../domain/contracts/gateways/essay-storage-gateway.js";
import type { IdGenerator } from "../../../domain/contracts/gateways/id-generator.js";
import type { EssayRepository } from "../../../domain/contracts/repositories/essay-repository.js";
import type { ThemeRepository } from "../../../domain/contracts/repositories/theme-repository.js";
import type { ThemeTopicRepository } from "../../../domain/contracts/repositories/theme-topic-repository.js";
import type { UserRepository } from "../../../domain/contracts/repositories/user-repository.js";
import { InsufficientCreditsError } from "../../../shared/errors/insufficient-credits-error.js";
import { NotFoundError } from "../../../shared/errors/not-found-error.js";

export interface UploadEssayDeps {
  essayRepository: EssayRepository;
  userRepository: UserRepository;
  themeRepository: ThemeRepository;
  themeTopicRepository: ThemeTopicRepository;
  essayStorageGateway: EssayStorageGateway;
  idGenerator: IdGenerator;
}

export interface UploadEssayInput {
  userId: string;
  themeId: string;
}

export interface UploadEssayOutput {
  essayId: string;
  upload: PresignedUpload;
}

export function createUploadEssay({
  essayRepository,
  userRepository,
  themeRepository,
  themeTopicRepository,
  essayStorageGateway,
  idGenerator,
}: UploadEssayDeps) {
  return async function uploadEssay({ userId, themeId }: UploadEssayInput): Promise<UploadEssayOutput> {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError("Usuário não encontrado");
    if (user.credits < 1) throw new InsufficientCreditsError();

    const themeResult = await themeRepository.findById(themeId);
    if (!themeResult) throw new NotFoundError("Tema não encontrado");

    const topic = await themeTopicRepository.findById(themeResult.theme.topicId);
    if (!topic) throw new NotFoundError("Eixo do tema não encontrado");

    const id = await idGenerator.generate();
    const fileKey = essayFileKey(id);
    const essay = Essay.create({
      id,
      fileKey,
      userId,
      themeId,
      themeTitle: themeResult.theme.title,
      topicColor: topic.color,
      enemYear: themeResult.theme.enemYear,
      topicTitle: topic.title,
    });
    await essayRepository.create(essay);

    const upload = await essayStorageGateway.createPresignedUpload({
      key: fileKey,
      maxSizeInBytes: ESSAY_PHOTO_MAX_SIZE_IN_BYTES,
    });

    return { essayId: essay.id, upload };
  };
}
