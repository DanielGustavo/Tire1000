import { z } from "zod";
import { Schema } from "../schema.js";

const loginBodySchema = z.object({
  email: z.email("E-mail inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export type LoginRequestBody = z.infer<typeof loginBodySchema>;

export class LoginSchema extends Schema<LoginRequestBody> {
  protected readonly definition = loginBodySchema;
}
