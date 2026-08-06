import { apigwAdapter } from "../../adapters/apigw-adapter.js";
import { GetCurrentUserController } from "../../../application/controllers/users/get-current-user-controller.js";
import { createGetCurrentUser } from "../../../application/use-cases/get-current-user/get-current-user.js";
import { DynamoUserRepository } from "../../../infra/repositories/dynamo-user-repository.js";

const getCurrentUser = createGetCurrentUser({ userRepository: new DynamoUserRepository() });

export const handler = apigwAdapter(new GetCurrentUserController(getCurrentUser));
