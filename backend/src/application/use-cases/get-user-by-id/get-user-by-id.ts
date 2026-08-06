import type { User } from "../../../domain/entities/user.js";
import type { UserRepository } from "../../../domain/contracts/repositories/user-repository.js";

export interface GetUserByIdDeps {
  userRepository: UserRepository;
}

export interface GetUserByIdInput {
  userId: string;
}

export function createGetUserById({ userRepository }: GetUserByIdDeps) {
  return async function getUserById({ userId }: GetUserByIdInput): Promise<User | null> {
    return userRepository.findById(userId);
  };
}
