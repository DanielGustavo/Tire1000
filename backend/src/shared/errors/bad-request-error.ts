import { DomainError } from "./domain-error.js";

export class BadRequestError extends DomainError {
  constructor(message = "Requisição inválida") {
    super(400, message);
  }
}
