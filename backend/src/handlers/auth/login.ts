import { apigwAdapter } from "../../adapters/apigw-adapter.js";
import { LoginController } from "../../controllers/auth/login-controller.js";
import { CognitoAuthGateway } from "../../gateways/cognito-auth-gateway.js";
import { createLogin } from "../../use-cases/login/login.js";

const login = createLogin({ authGateway: new CognitoAuthGateway() });

export const handler = apigwAdapter(new LoginController(login));
