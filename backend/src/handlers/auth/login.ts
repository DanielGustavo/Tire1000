import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { InvalidCredentialsError } from "../../gateways/auth-gateway.js";
import { CognitoAuthGateway } from "../../gateways/cognito-auth-gateway.js";
import { createLogin } from "../../use-cases/login/login.js";

const login = createLogin({ authGateway: new CognitoAuthGateway() });

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const body = JSON.parse(event.body ?? "{}");
  const { email, password } = body;

  if (!email || !password) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "email and password are required" }),
    };
  }

  try {
    const tokens = await login({ email, password });
    return { statusCode: 200, body: JSON.stringify(tokens) };
  } catch (error) {
    if (error instanceof InvalidCredentialsError) {
      return { statusCode: 401, body: JSON.stringify({ message: error.message }) };
    }
    throw error;
  }
};
