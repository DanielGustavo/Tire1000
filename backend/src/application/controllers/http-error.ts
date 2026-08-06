export class HttpError extends Error {
  public readonly body: unknown;

  constructor(
    public readonly statusCode: number,
    message: string,
    body?: unknown,
  ) {
    super(message);
    this.name = "HttpError";
    this.body = body ?? { message };
  }
}
