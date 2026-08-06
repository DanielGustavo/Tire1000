import { essayFileKey, ESSAY_PHOTO_MAX_SIZE_IN_BYTES, RESENDABLE_ESSAY_STATUSES } from "../../../domain/entities/essay.js";
import type { EssayStorageGateway } from "../../../domain/contracts/gateways/essay-storage-gateway.js";
import type { EssayRepository } from "../../../domain/contracts/repositories/essay-repository.js";
import type { UserRepository } from "../../../domain/contracts/repositories/user-repository.js";
import { ConflictError } from "../../../shared/errors/conflict-error.js";
import { InsufficientCreditsError } from "../../../shared/errors/insufficient-credits-error.js";
import { NotFoundError } from "../../../shared/errors/not-found-error.js";
import type { UploadEssayOutput } from "../upload-essay/upload-essay.js";

export interface ResendEssayDeps {
  essayRepository: EssayRepository;
  userRepository: UserRepository;
  essayStorageGateway: EssayStorageGateway;
}

export interface ResendEssayInput {
  userId: string;
  essayId: string;
}

export type ResendEssayOutput = UploadEssayOutput;

export function createResendEssay({ essayRepository, userRepository, essayStorageGateway }: ResendEssayDeps) {
  return async function resendEssay({ userId, essayId }: ResendEssayInput): Promise<ResendEssayOutput> {
    const essay = await essayRepository.findById(essayId);
    if (!essay || essay.userId !== userId) throw new NotFoundError("Redação não encontrada");

    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError("Usuário não encontrado");
    if (user.credits < 1) throw new InsufficientCreditsError();

    const expectedCurrentStatus = essay.status;
    if (!RESENDABLE_ESSAY_STATUSES.includes(expectedCurrentStatus)) {
      throw new ConflictError("Só é possível reenviar uma redação que esteja aguardando envio ou tenha sido rejeitada");
    }

    const fileKey = essayFileKey(essay.id);
    essay.resetForResend(fileKey);
    const { applied } = await essayRepository.updateStatus(essay, { expectedCurrentStatus });
    if (!applied) throw new ConflictError("A redação foi atualizada por outra requisição — tente novamente");

    const upload = await essayStorageGateway.createPresignedUpload({
      key: fileKey,
      maxSizeInBytes: ESSAY_PHOTO_MAX_SIZE_IN_BYTES,
    });

    return { essayId: essay.id, upload };
  };
}
