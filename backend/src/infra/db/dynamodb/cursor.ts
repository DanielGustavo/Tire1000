import { BadRequestError } from "../../../shared/errors/bad-request-error.js";

/** Opaque pagination cursor: base64 of a DynamoDB `LastEvaluatedKey`/`ExclusiveStartKey`. */
export function encodeCursor(key: Record<string, unknown>): string {
  return Buffer.from(JSON.stringify(key)).toString("base64");
}

export function decodeCursor(cursor: string): Record<string, unknown> {
  try {
    const decoded = JSON.parse(Buffer.from(cursor, "base64").toString("utf8"));
    if (!decoded || typeof decoded !== "object" || Array.isArray(decoded)) throw new Error("not a key object");
    return decoded as Record<string, unknown>;
  } catch {
    throw new BadRequestError("Cursor de paginação inválido");
  }
}
