import { DomainError } from "./domain-error.js";

export class ConflictError extends DomainError {
  constructor(message = "Conflito") {
    super(409, message);
  }
}
