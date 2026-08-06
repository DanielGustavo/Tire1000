import { DomainError } from "../../shared/errors/domain-error.js";
import { HttpError } from "./http-error.js";

export interface ControllerAuth {
  /** Cognito sub of the authenticated user — resolve to an internal User via UserRepository#findByExternalId. */
  externalId: string;
}

export interface ControllerRequest {
  body: unknown;
  headers: Record<string, string | undefined>;
  pathParameters: Record<string, string | undefined>;
  queryStringParameters: Record<string, string | undefined>;
  auth: ControllerAuth | null;
}

export interface ControllerResponse {
  statusCode: number;
  body: unknown;
}

export abstract class Controller {
  protected abstract handle(request: ControllerRequest): Promise<ControllerResponse>;

  async execute(request: ControllerRequest): Promise<ControllerResponse> {
    try {
      return await this.handle(request);
    } catch (error) {
      if (error instanceof DomainError) {
        throw new HttpError(error.statusCode, error.message, error.body);
      }
      throw error;
    }
  }
}
