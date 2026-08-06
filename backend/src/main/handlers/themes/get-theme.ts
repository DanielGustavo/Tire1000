import { apigwAdapter } from "../../adapters/apigw-adapter.js";
import { GetThemeController } from "../../../application/controllers/themes/get-theme-controller.js";
import { DynamoThemeRepository } from "../../../infra/repositories/dynamo-theme-repository.js";
import { DynamoReferenceTextRepository } from "../../../infra/repositories/dynamo-reference-text-repository.js";
import { createGetTheme } from "../../../application/use-cases/get-theme/get-theme.js";

const getTheme = createGetTheme({
  themeRepository: new DynamoThemeRepository(),
  referenceTextRepository: new DynamoReferenceTextRepository(),
});

export const handler = apigwAdapter(new GetThemeController(getTheme));
