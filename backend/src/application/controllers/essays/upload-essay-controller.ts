import type { createUploadEssay } from "../../use-cases/upload-essay/upload-essay.js";
import { UnauthorizedError } from "../../../shared/errors/unauthorized-error.js";
import { Controller, type ControllerRequest, type ControllerResponse } from "../controller.js";
import { UploadEssaySchema } from "./upload-essay-schema.js";

type UploadEssay = ReturnType<typeof createUploadEssay>;

export class UploadEssayController extends Controller {
  private readonly schema = new UploadEssaySchema();

  constructor(private readonly uploadEssay: UploadEssay) {
    super();
  }

  protected async handle({ body, auth }: ControllerRequest): Promise<ControllerResponse> {
    if (!auth) throw new UnauthorizedError();

    const { themeId } = this.schema.parse(body);
    const result = await this.uploadEssay({ userId: auth.id, themeId });

    return { statusCode: 201, body: result };
  }
}
