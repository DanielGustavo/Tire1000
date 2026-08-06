import { DomainError } from "./domain-error.js";

export class UnauthorizedError extends DomainError {
  constructor(message = "Não autorizado") {
    super(401, message);
  }
}
