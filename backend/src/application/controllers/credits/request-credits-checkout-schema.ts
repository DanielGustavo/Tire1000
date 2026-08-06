import { z } from "zod";
import { Schema } from "../schema.js";

const requestCreditsCheckoutBodySchema = z.object({
  creditsQty: z.number().int().positive("A quantidade de créditos deve ser maior que zero"),
});

export type RequestCreditsCheckoutRequestBody = z.infer<typeof requestCreditsCheckoutBodySchema>;

export class RequestCreditsCheckoutSchema extends Schema<RequestCreditsCheckoutRequestBody> {
  protected readonly definition = requestCreditsCheckoutBodySchema;
}
