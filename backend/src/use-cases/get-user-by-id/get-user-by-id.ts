import type { User } from "../../domain/user.js";
import type { UserRepository } from "../../contracts/user-repository.js";

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
