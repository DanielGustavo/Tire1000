import { apigwAdapter } from "../../adapters/apigw-adapter.js";
import { SignupController } from "../../controllers/auth/signup-controller.js";
import { CognitoAuthGateway } from "../../gateways/cognito-auth-gateway.js";
import { KsuidIdGenerator } from "../../gateways/ksuid-id-generator.js";
import { SystemClock } from "../../gateways/system-clock.js";
import { DynamoUserRepository } from "../../repositories/dynamo-user-repository.js";
import { createSignUpUser } from "../../use-cases/sign-up-user/sign-up-user.js";

const signUpUser = createSignUpUser({
  authGateway: new CognitoAuthGateway(),
  userRepository: new DynamoUserRepository(),
  idGenerator: new KsuidIdGenerator(),
  clock: new SystemClock(),
});

export const handler = apigwAdapter(new SignupController(signUpUser));
