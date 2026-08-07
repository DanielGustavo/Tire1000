import { z } from "zod";

/** Translates a domain Zod schema into the JSON Schema the Gemini SDK expects for structured output. */
export function toGeminiResponseSchema(schema: z.ZodType): unknown {
  return z.toJSONSchema(schema);
}
