import type { EssayRepository } from "../../../domain/contracts/repositories/essay-repository.js";
import { toEssayDTO, type EssayDTO } from "../../dtos/essay-dto.js";

export interface ListUserEssaysDeps {
  essayRepository: EssayRepository;
}

export interface ListUserEssaysInput {
  userId: string;
}

export interface ListUserEssaysOutput {
  essays: EssayDTO[];
}

export function createListUserEssays({ essayRepository }: ListUserEssaysDeps) {
  return async function listUserEssays({ userId }: ListUserEssaysInput): Promise<ListUserEssaysOutput> {
    const essays = await essayRepository.listByUserId(userId);
    return { essays: essays.map(toEssayDTO) };
  };
}
