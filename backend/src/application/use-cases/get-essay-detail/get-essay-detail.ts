import type { EssayRepository } from "../../../domain/contracts/repositories/essay-repository.js";
import { NotFoundError } from "../../../shared/errors/not-found-error.js";
import { toEssayDTO, type EssayDTO } from "../../dtos/essay-dto.js";

export interface GetEssayDetailDeps {
  essayRepository: EssayRepository;
}

export interface GetEssayDetailInput {
  userId: string;
  essayId: string;
}

export interface GetEssayDetailOutput {
  essay: EssayDTO;
}

export function createGetEssayDetail({ essayRepository }: GetEssayDetailDeps) {
  return async function getEssayDetail({ userId, essayId }: GetEssayDetailInput): Promise<GetEssayDetailOutput> {
    const essay = await essayRepository.findById(essayId);
    if (!essay || essay.userId !== userId) throw new NotFoundError("Redação não encontrada");

    return { essay: toEssayDTO(essay) };
  };
}
