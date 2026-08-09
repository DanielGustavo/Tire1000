import axios from "axios";

/** Plain AxiosInstance factory — no auth awareness. Header injection and refresh/retry live in
 * the base `Service` class (see `services/service.ts`), which every concrete service extends. */
export function createHttpClient() {
  return axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3000",
  });
}

export const httpClient = createHttpClient();

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error) && typeof error.response?.data?.message === "string") {
    return error.response.data.message;
  }
  return fallback;
}

export type ApiFieldErrors = Record<string, string[]>;

export type AppliedFieldErrors = {
  /** Per-field messages keyed by field name (the backend's `_` key — errors with no specific
   * field — is excluded here, it feeds `toastMessage` instead). Apply via `errors={fieldErrors.email}`. */
  fieldErrors: ApiFieldErrors;
  /** Message to show as a toast: the `_`-keyed messages from a `fields` error, or `.message` from
   * a plain `{ message }` error. `null` when the error was fully absorbed by `fieldErrors`. */
  toastMessage: string | null;
};

/**
 * Inspects an API error against the backend's established contract (`Schema`/`FieldsError`, see
 * `backend/src/application/controllers/schema.ts`): a Zod validation failure responds `400` with
 * `{ fields: Record<string, string[]> }` (key `_` for errors with no specific field); any other
 * `DomainError` responds with `{ message: string }`. Anything that doesn't match either shape
 * (network failure, unexpected 500, ...) falls back to `fallbackMessage` as a toast.
 */
export function applyFieldErrors(error: unknown, fallbackMessage: string): AppliedFieldErrors {
  if (axios.isAxiosError(error)) {
    const data: unknown = error.response?.data;

    if (data && typeof data === "object" && "fields" in data) {
      const { _: formErrors, ...fieldErrors } = data.fields as ApiFieldErrors;
      return {
        fieldErrors,
        toastMessage: formErrors && formErrors.length > 0 ? formErrors.join(" ") : null,
      };
    }

    if (data && typeof data === "object" && "message" in data && typeof data.message === "string") {
      return { fieldErrors: {}, toastMessage: data.message };
    }
  }

  return { fieldErrors: {}, toastMessage: fallbackMessage };
}
