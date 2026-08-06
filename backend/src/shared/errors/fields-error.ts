import { DomainError } from "./domain-error.js";

export class FieldsError extends DomainError {
  constructor(public readonly fields: Record<string, string[]>) {
    super(400, FieldsError.buildMessage(fields));
  }

  private static buildMessage(fields: Record<string, string[]>): string {
    return Object.entries(fields)
      .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
      .join("; ");
  }

  override get body(): unknown {
    return { fields: this.fields };
  }
}
