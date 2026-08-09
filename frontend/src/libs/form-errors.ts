import type { FieldError } from "react-hook-form";

/**
 * Flattens a react-hook-form `FieldError` into a message list, for `Field`'s `errors: string[]`.
 * With `criteriaMode: "all"`, zod issues sharing the same rule (e.g. multiple failed `.regex()`
 * checks on a password) land grouped under `error.types` instead of the single `error.message`.
 */
export function fieldErrorMessages(error?: FieldError): string[] {
  if (!error) return [];
  if (!error.types) return error.message ? [error.message] : [];

  return Object.values(error.types).flatMap((value) =>
    Array.isArray(value) ? value.map(String) : value !== undefined ? [String(value)] : [],
  );
}
