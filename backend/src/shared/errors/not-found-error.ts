import { DomainError } from "./domain-error.js";

export class NotFoundError extends DomainError {
  constructor(message = "Recurso não encontrado") {
    super(404, message);
  }
}
