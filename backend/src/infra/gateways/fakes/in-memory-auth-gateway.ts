import {
  EmailAlreadyExistsError,
  InvalidCredentialsError,
  type AuthGateway,
  type AuthLoginInput,
  type AuthSignUpInput,
  type AuthTokens,
} from "../../../domain/contracts/gateways/auth-gateway.js";

interface FakeCognitoUser {
  externalId: string;
  password: string;
}

export class InMemoryAuthGateway implements AuthGateway {
  private readonly usersByEmail = new Map<string, FakeCognitoUser>();
  private counter = 0;

  async signUp({ email, password }: AuthSignUpInput): Promise<{ externalId: string }> {
    if (this.usersByEmail.has(email)) {
      throw new EmailAlreadyExistsError(email);
    }

    this.counter += 1;
    const externalId = `fake-cognito-sub-${this.counter}`;
    this.usersByEmail.set(email, { externalId, password });

    return { externalId };
  }

  async login({ email, password }: AuthLoginInput): Promise<AuthTokens> {
    const user = this.usersByEmail.get(email);
    if (!user || user.password !== password) {
      throw new InvalidCredentialsError();
    }

    return {
      accessToken: `fake-access-token-${user.externalId}`,
      idToken: `fake-id-token-${user.externalId}`,
      refreshToken: `fake-refresh-token-${user.externalId}`,
      expiresIn: 3600,
    };
  }

  async deleteUser({ email }: { email: string }): Promise<void> {
    this.usersByEmail.delete(email);
  }
}
