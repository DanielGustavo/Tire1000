import {
  AdminCreateUserCommand,
  AdminDeleteUserCommand,
  AdminInitiateAuthCommand,
  AdminSetUserPasswordCommand,
  CognitoIdentityProviderClient,
  InvalidPasswordException,
  NotAuthorizedException,
  UserNotFoundException,
  UsernameExistsException,
} from "@aws-sdk/client-cognito-identity-provider";
import {
  EmailAlreadyExistsError,
  InvalidCredentialsError,
  WeakPasswordError,
  type AuthGateway,
  type AuthLoginInput,
  type AuthSignUpInput,
  type AuthTokens,
} from "../../domain/contracts/gateways/auth-gateway.js";

export class CognitoAuthGateway implements AuthGateway {
  constructor(
    private readonly userPoolId: string = process.env.USER_POOL_ID ?? "",
    private readonly clientId: string = process.env.USER_POOL_CLIENT_ID ?? "",
    private readonly client: CognitoIdentityProviderClient = new CognitoIdentityProviderClient({}),
  ) {}

  async signUp({ name, email, password }: AuthSignUpInput): Promise<{ externalId: string }> {
    let created;
    try {
      created = await this.client.send(
        new AdminCreateUserCommand({
          UserPoolId: this.userPoolId,
          Username: email,
          MessageAction: "SUPPRESS",
          UserAttributes: [
            { Name: "email", Value: email },
            { Name: "email_verified", Value: "true" },
            { Name: "name", Value: name },
          ],
        }),
      );
    } catch (error) {
      if (error instanceof UsernameExistsException) {
        throw new EmailAlreadyExistsError(email);
      }
      throw error;
    }

    try {
      await this.client.send(
        new AdminSetUserPasswordCommand({
          UserPoolId: this.userPoolId,
          Username: email,
          Password: password,
          Permanent: true,
        }),
      );
    } catch (error) {
      // The user was already created above (with no usable password) — leaving it
      // in place would permanently block this email from ever signing up again.
      await this.deleteUser({ email });
      if (error instanceof InvalidPasswordException) {
        throw new WeakPasswordError(error.message);
      }
      throw error;
    }

    const externalId = created.User?.Attributes?.find((attribute) => attribute.Name === "sub")?.Value;
    if (!externalId) {
      throw new Error("Cognito did not return a sub attribute for the created user");
    }

    return { externalId };
  }

  async login({ email, password }: AuthLoginInput): Promise<AuthTokens> {
    try {
      const result = await this.client.send(
        new AdminInitiateAuthCommand({
          UserPoolId: this.userPoolId,
          ClientId: this.clientId,
          AuthFlow: "ADMIN_USER_PASSWORD_AUTH",
          AuthParameters: { USERNAME: email, PASSWORD: password },
        }),
      );

      const authResult = result.AuthenticationResult;
      if (!authResult?.AccessToken || !authResult.IdToken || !authResult.RefreshToken) {
        throw new InvalidCredentialsError();
      }

      return {
        accessToken: authResult.AccessToken,
        idToken: authResult.IdToken,
        refreshToken: authResult.RefreshToken,
        expiresIn: authResult.ExpiresIn ?? 3600,
      };
    } catch (error) {
      if (error instanceof NotAuthorizedException || error instanceof UserNotFoundException) {
        throw new InvalidCredentialsError();
      }
      throw error;
    }
  }

  async deleteUser({ email }: { email: string }): Promise<void> {
    await this.client.send(
      new AdminDeleteUserCommand({ UserPoolId: this.userPoolId, Username: email }),
    );
  }
}
