import { apigwAdapter } from "../../adapters/apigw-adapter.js";
import { LoginController } from "../../../application/controllers/auth/login-controller.js";
import { CognitoAuthGateway } from "../../../infra/gateways/cognito-auth-gateway.js";
import { createLogin } from "../../../application/use-cases/login/login.js";

const login = createLogin({ authGateway: new CognitoAuthGateway() });

export const handler = apigwAdapter(new LoginController(login));
