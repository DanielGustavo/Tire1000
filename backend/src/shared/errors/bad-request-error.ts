import { DomainError } from "./domain-error.js";

export class BadRequestError extends DomainError {
  constructor(message = "Bad request") {
    super(400, message);
  }
}
