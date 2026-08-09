/**
 * Client-side duplicate of the backend's signup rules (`backend/src/application/controllers/auth/signup-schema.ts`).
 * Intentional duplication — there's no shared package between `frontend` and `backend` to source this
 * from, and the `fields`/toast error contract (see `libs/axios.ts#applyFieldErrors`) already covers the
 * backend rejecting input that slips past this check anyway.
 */
import { z } from "zod";

export const signUpSchema = z
  .object({
    name: z.string().min(1, "Nome é obrigatório"),
    email: z.email("E-mail inválido"),
    password: z
      .string()
      .min(8, "A senha deve ter no mínimo 8 caracteres")
      .regex(/[a-z]/, "A senha deve conter uma letra minúscula")
      .regex(/[A-Z]/, "A senha deve conter uma letra maiúscula")
      .regex(/[0-9]/, "A senha deve conter um número"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type SignUpFormValues = z.infer<typeof signUpSchema>;
