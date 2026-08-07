import type { EssayEvaluationRepository } from "../../../domain/contracts/repositories/essay-evaluation-repository.js";
import type { EssayRepository } from "../../../domain/contracts/repositories/essay-repository.js";
import { NotFoundError } from "../../../shared/errors/not-found-error.js";
import { toEssayDetailDTO, type EssayDetailDTO } from "../../dtos/essay-dto.js";

export interface GetEssayDetailDeps {
  essayRepository: EssayRepository;
  essayEvaluationRepository: EssayEvaluationRepository;
}

export interface GetEssayDetailInput {
  userId: string;
  essayId: string;
}

export interface GetEssayDetailOutput {
  essay: EssayDetailDTO;
}

export function createGetEssayDetail({ essayRepository, essayEvaluationRepository }: GetEssayDetailDeps) {
  return async function getEssayDetail({ userId, essayId }: GetEssayDetailInput): Promise<GetEssayDetailOutput> {
    const essay = await essayRepository.findById(essayId);
    if (!essay || essay.userId !== userId) throw new NotFoundError("Redação não encontrada");

    // Independent lookup by essayId (own PK/SK, see essay-evaluation-item.ts) rather than the joint
    // GSI1 query the spec's data model would allow — simpler, and null-until-Avaliação-finishes is
    // the common case this needs to handle either way.
    const evaluation = await essayEvaluationRepository.findByEssayId(essayId);

    return { essay: toEssayDetailDTO(essay, evaluation) };
  };
}
