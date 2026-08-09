/**
 * Client-side duplicate of the backend's password rules (`backend/src/application/controllers/auth/signup-schema.ts`).
 * Intentional duplication — there's no shared package between `frontend` and `backend` to source this
 * from, and the `fields`/toast error contract (see `libs/axios.ts#applyFieldErrors`) already covers the
 * backend rejecting a password that slips past this check anyway.
 */
export function validatePassword(password: string): string[] {
  const errors: string[] = [];

  if (password.length < 8) errors.push("A senha deve ter no mínimo 8 caracteres");
  if (!/[a-z]/.test(password)) errors.push("A senha deve conter uma letra minúscula");
  if (!/[A-Z]/.test(password)) errors.push("A senha deve conter uma letra maiúscula");
  if (!/[0-9]/.test(password)) errors.push("A senha deve conter um número");

  return errors;
}
