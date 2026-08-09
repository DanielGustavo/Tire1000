/**
 * Client-side duplicate of the backend's login rules (`backend/src/application/controllers/auth/login-schema.ts`).
 * Intentional duplication — there's no shared package between `frontend` and `backend` to source this
 * from, and the `fields`/toast error contract (see `libs/axios.ts#applyFieldErrors`) already covers the
 * backend rejecting input that slips past this check anyway.
 */
import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("E-mail inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
