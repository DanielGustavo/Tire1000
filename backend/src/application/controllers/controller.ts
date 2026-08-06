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

export abstract class Controller {
  abstract handle(request: ControllerRequest): Promise<ControllerResponse>;
}
