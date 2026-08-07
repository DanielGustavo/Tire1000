import type { Part } from "@google/genai";
import type { z } from "zod";
import { createGeminiClient } from "./client.js";
import { estimateAmountInCents } from "./cost.js";
import { toGeminiResponseSchema } from "./schema.js";
import type { GeminiModelId } from "../models.js";

export interface CallGeminiModelParams<Schema extends z.ZodType> {
  model: GeminiModelId;
  prompt: string;
  image?: Buffer;
  schema: Schema;
}

export interface CallGeminiModelResult<Schema extends z.ZodType> {
  data: z.infer<Schema>;
  tokens: number;
  amountInCents: number;
}

/** Calls a Gemini model with structured output enforced from a domain Zod schema, reusable across AI pipeline steps. */
export async function callGeminiModel<Schema extends z.ZodType>({
  model,
  prompt,
  image,
  schema,
}: CallGeminiModelParams<Schema>): Promise<CallGeminiModelResult<Schema>> {
  const parts: Part[] = [{ text: prompt }];
  if (image) parts.push({ inlineData: { mimeType: "image/jpeg", data: image.toString("base64") } });

  const response = await createGeminiClient().models.generateContent({
    model,
    contents: [{ role: "user", parts }],
    config: { responseMimeType: "application/json", responseJsonSchema: toGeminiResponseSchema(schema) },
  });

  const parsed = schema.safeParse(JSON.parse(response.text ?? "{}"));
  if (!parsed.success) {
    throw new Error(`callGeminiModel: resposta do modelo "${model}" não bateu com o schema esperado: ${parsed.error.message}`);
  }

  const tokens = response.usageMetadata?.totalTokenCount ?? 0;
  return { data: parsed.data, tokens, amountInCents: estimateAmountInCents(tokens, model) };
}
