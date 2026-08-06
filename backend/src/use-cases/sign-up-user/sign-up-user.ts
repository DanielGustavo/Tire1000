import type { User } from "../../domain/user.js";
import type { AuthGateway, AuthTokens } from "../../contracts/auth-gateway.js";
import type { Clock } from "../../contracts/clock.js";
import type { IdGenerator } from "../../contracts/id-generator.js";
import type { UserRepository } from "../../contracts/user-repository.js";

export interface SignUpUserDeps {
  authGateway: AuthGateway;
  userRepository: UserRepository;
  idGenerator: IdGenerator;
  clock: Clock;
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

export function createSignUpUser({ authGateway, userRepository, idGenerator, clock }: SignUpUserDeps) {
  return async function signUpUser({ name, email, password }: SignUpUserInput): Promise<SignUpUserOutput> {
    const { externalId } = await authGateway.signUp({ name, email, password });

    const now = clock.now().toISOString();
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
