import { apigwAdapter } from "../../adapters/apigw-adapter.js";
import { ListThemesController } from "../../../application/controllers/themes/list-themes-controller.js";
import { DynamoThemeRepository } from "../../../infra/repositories/dynamo-theme-repository.js";
import { createListThemes } from "../../../application/use-cases/list-themes/list-themes.js";

const listThemes = createListThemes({ themeRepository: new DynamoThemeRepository() });

export const handler = apigwAdapter(new ListThemesController(listThemes));
