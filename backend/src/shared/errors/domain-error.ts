export abstract class DomainError extends Error {
  protected constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = new.target.name;
  }

  get body(): unknown {
    return { message: this.message };
  }
}
