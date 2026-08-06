import { HttpError } from "../../application/controllers/http-error.js";

export function mapErrorResponse(error: unknown): { statusCode: number; body: string } {
  if (error instanceof HttpError) {
    return { statusCode: error.statusCode, body: JSON.stringify(error.body) };
  }
  console.error(error);
  return { statusCode: 500, body: JSON.stringify({ message: "Erro interno do servidor" }) };
}
