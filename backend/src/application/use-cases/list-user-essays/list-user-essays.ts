import type { EssayRepository } from "../../../domain/contracts/repositories/essay-repository.js";
import { toEssayDTO, type EssayDTO } from "../../dtos/essay-dto.js";

// Only consumer today is the Home page's "Suas redações" section — no query param exposes this,
// per the pagination ticket's decision to avoid a knob with no real use yet.
const ESSAYS_PAGE_SIZE = 5;

export interface ListUserEssaysDeps {
  essayRepository: EssayRepository;
}

export interface ListUserEssaysInput {
  userId: string;
  cursor?: string;
}

export interface ListUserEssaysOutput {
  essays: EssayDTO[];
  nextCursor?: string;
}

export function createListUserEssays({ essayRepository }: ListUserEssaysDeps) {
  return async function listUserEssays({ userId, cursor }: ListUserEssaysInput): Promise<ListUserEssaysOutput> {
    const { essays, nextCursor } = await essayRepository.listByUserId(userId, { limit: ESSAYS_PAGE_SIZE, cursor });
    return { essays: essays.map(toEssayDTO), nextCursor };
  };
}
