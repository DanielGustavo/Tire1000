import { User } from "../../../domain/entities/user.js";
import type { AuthGateway } from "../../../domain/contracts/gateways/auth-gateway.js";
import type { IdGenerator } from "../../../domain/contracts/gateways/id-generator.js";
import type { UserRepository } from "../../../domain/contracts/repositories/user-repository.js";
import { toAuthTokensDTO, type AuthTokensDTO } from "../../dtos/auth-tokens-dto.js";
import { toUserDTO, type UserDTO } from "../../dtos/user-dto.js";

export interface SignUpUserDeps {
  authGateway: AuthGateway;
  userRepository: UserRepository;
  idGenerator: IdGenerator;
}

export interface SignUpUserInput {
  name: string;
  email: string;
  password: string;
}

export interface SignUpUserOutput {
  user: UserDTO;
  tokens: AuthTokensDTO;
}

export function createSignUpUser({ authGateway, userRepository, idGenerator }: SignUpUserDeps) {
  return async function signUpUser({ name, email, password }: SignUpUserInput): Promise<SignUpUserOutput> {
    const { externalId } = await authGateway.signUp({ name, email, password });

    const user = User.create({ id: await idGenerator.generate(), externalId, email, name });
    try {
      await userRepository.create(user);
    } catch (error) {
      await authGateway.deleteUser({ email });
      throw error;
    }

    const tokens = await authGateway.login({ email, password });

    return { user: toUserDTO(user), tokens: toAuthTokensDTO(tokens) };
  };
}
