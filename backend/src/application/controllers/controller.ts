import { HttpError } from "./http-error.js";

export interface ControllerRequest {
  body: unknown;
  headers: Record<string, string | undefined>;
  pathParameters: Record<string, string | undefined>;
  queryStringParameters: Record<string, string | undefined>;
}

export interface ControllerResponse {
  statusCode: number;
  body: unknown;
}

type ErrorMapping = [errorClass: new (...args: never[]) => Error, statusCode: number];

export abstract class Controller {
  abstract handle(request: ControllerRequest): Promise<ControllerResponse>;

  protected mapError(error: unknown, mappings: ErrorMapping[]): never {
    for (const [ErrorClass, statusCode] of mappings) {
      if (error instanceof ErrorClass) {
        throw new HttpError(statusCode, error.message);
      }
    }
    throw error;
  }
}
