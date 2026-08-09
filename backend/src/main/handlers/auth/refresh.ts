import { apigwAdapter } from "../../adapters/apigw-adapter.js";
import { RefreshController } from "../../../application/controllers/auth/refresh-controller.js";
import { CognitoAuthGateway } from "../../../infra/gateways/cognito-auth-gateway.js";
import { createRefreshToken } from "../../../application/use-cases/refresh-token/refresh-token.js";

const refreshToken = createRefreshToken({ authGateway: new CognitoAuthGateway() });

export const handler = apigwAdapter(new RefreshController(refreshToken));
