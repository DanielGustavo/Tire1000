import type { EssayRepository } from "../../../domain/contracts/repositories/essay-repository.js";
import { NotFoundError } from "../../../shared/errors/not-found-error.js";
import { toEssayDetailDTO, type EssayDetailDTO } from "../../dtos/essay-dto.js";

export interface GetEssayDetailDeps {
  essayRepository: EssayRepository;
}

export interface GetEssayDetailInput {
  userId: string;
  essayId: string;
}

export interface GetEssayDetailOutput {
  essay: EssayDetailDTO;
}

export function createGetEssayDetail({ essayRepository }: GetEssayDetailDeps) {
  return async function getEssayDetail({ userId, essayId }: GetEssayDetailInput): Promise<GetEssayDetailOutput> {
    // Single GSI1 query for both the essay and its evaluation (they share GSI1PK by design — see
    // EssayRepository#findByIdWithEvaluation) rather than two separate repository calls.
    const result = await essayRepository.findByIdWithEvaluation(essayId);
    if (!result || result.essay.userId !== userId) throw new NotFoundError("Redação não encontrada");

    return { essay: toEssayDetailDTO(result.essay, result.evaluation) };
  };
}
