import { z } from "zod";
import { Schema } from "../schema.js";

const signupBodySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.email("E-mail inválido"),
  password: z
    .string()
    .min(8, "A senha deve ter no mínimo 8 caracteres")
    .regex(/[a-z]/, "A senha deve conter uma letra minúscula")
    .regex(/[A-Z]/, "A senha deve conter uma letra maiúscula")
    .regex(/[0-9]/, "A senha deve conter um número"),
  creditsQty: z.number().int().nonnegative("A quantidade de créditos não pode ser negativa").optional(),
});

export type SignupRequestBody = z.infer<typeof signupBodySchema>;

export class SignupSchema extends Schema<SignupRequestBody> {
  protected readonly definition = signupBodySchema;
}
