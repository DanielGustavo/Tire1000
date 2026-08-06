import { apigwAdapter } from "../../adapters/apigw-adapter.js";
import { SignupController } from "../../../application/controllers/auth/signup-controller.js";
import { CognitoAuthGateway } from "../../../infra/gateways/cognito-auth-gateway.js";
import { KsuidIdGenerator } from "../../../infra/gateways/ksuid-id-generator.js";
import { DynamoUserRepository } from "../../../infra/repositories/dynamo-user-repository.js";
import { createSignUpUser } from "../../../application/use-cases/sign-up-user/sign-up-user.js";

const signUpUser = createSignUpUser({
  authGateway: new CognitoAuthGateway(),
  userRepository: new DynamoUserRepository(),
  idGenerator: new KsuidIdGenerator(),
});

export const handler = apigwAdapter(new SignupController(signUpUser));
