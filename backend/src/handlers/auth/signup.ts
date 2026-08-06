import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { EmailAlreadyExistsError, WeakPasswordError } from "../../gateways/auth-gateway.js";
import { CognitoAuthGateway } from "../../gateways/cognito-auth-gateway.js";
import { SystemClock } from "../../gateways/clock.js";
import { KsuidIdGenerator } from "../../gateways/id-generator.js";
import { DynamoUserRepository } from "../../repositories/dynamo-user-repository.js";
import { createSignUpUser } from "../../use-cases/sign-up-user/sign-up-user.js";

const signUpUser = createSignUpUser({
  authGateway: new CognitoAuthGateway(),
  userRepository: new DynamoUserRepository(),
  idGenerator: new KsuidIdGenerator(),
  clock: new SystemClock(),
});

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const body = JSON.parse(event.body ?? "{}");
  const { name, email, password } = body;

  if (!name || !email || !password) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "name, email and password are required" }),
    };
  }

  try {
    const result = await signUpUser({ name, email, password });
    return { statusCode: 201, body: JSON.stringify(result) };
  } catch (error) {
    if (error instanceof EmailAlreadyExistsError) {
      return { statusCode: 409, body: JSON.stringify({ message: error.message }) };
    }
    if (error instanceof WeakPasswordError) {
      return { statusCode: 400, body: JSON.stringify({ message: error.message }) };
    }
    throw error;
  }
};
