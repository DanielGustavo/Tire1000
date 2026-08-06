import type { UserRepository } from "../../../domain/contracts/repositories/user-repository.js";
import { toUserDTO, type UserDTO } from "../../dtos/user-dto.js";

export interface GetUserByIdDeps {
  userRepository: UserRepository;
}

export interface GetUserByIdInput {
  userId: string;
}

export function createGetUserById({ userRepository }: GetUserByIdDeps) {
  return async function getUserById({ userId }: GetUserByIdInput): Promise<UserDTO | null> {
    const user = await userRepository.findById(userId);
    return user ? toUserDTO(user) : null;
  };
}
