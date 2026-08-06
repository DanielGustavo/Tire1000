import { BadRequestError } from "./bad-request-error.js";

export class InsufficientCreditsError extends BadRequestError {
  constructor() {
    super("Você não tem créditos suficientes para enviar uma redação");
  }
}
