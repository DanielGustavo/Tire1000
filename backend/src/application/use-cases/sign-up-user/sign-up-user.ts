import type { User } from "../../../domain/entities/user.js";
import type { AuthGateway, AuthTokens } from "../../../domain/contracts/gateways/auth-gateway.js";
import type { IdGenerator } from "../../../domain/contracts/gateways/id-generator.js";
import type { UserRepository } from "../../../domain/contracts/repositories/user-repository.js";

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
  user: User;
  tokens: AuthTokens;
}

export function createSignUpUser({ authGateway, userRepository, idGenerator }: SignUpUserDeps) {
  return async function signUpUser({ name, email, password }: SignUpUserInput): Promise<SignUpUserOutput> {
    const { externalId } = await authGateway.signUp({ name, email, password });

    const now = new Date().toISOString();
    const user: User = {
      id: await idGenerator.generate(),
      type: "USER",
      externalId,
      email,
      name,
      credits: 0,
      createdAt: now,
      updatedAt: now,
    };
    try {
      await userRepository.create(user);
    } catch (error) {
      await authGateway.deleteUser({ email });
      throw error;
    }

    const tokens = await authGateway.login({ email, password });

    return { user, tokens };
  };
}
