import type { UserRepository } from "../../../domain/contracts/repositories/user-repository.js";
import { toUserDTO, type UserDTO } from "../../dtos/user-dto.js";

export interface GetCurrentUserDeps {
  userRepository: UserRepository;
}

export interface GetCurrentUserInput {
  externalId: string;
}

export function createGetCurrentUser({ userRepository }: GetCurrentUserDeps) {
  return async function getCurrentUser({ externalId }: GetCurrentUserInput): Promise<UserDTO | null> {
    const user = await userRepository.findByExternalId(externalId);
    return user ? toUserDTO(user) : null;
  };
}
