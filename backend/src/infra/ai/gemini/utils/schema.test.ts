import { z } from "zod";
import { describe, expect, it } from "vitest";
import { toGeminiResponseSchema } from "./schema.js";

describe("toGeminiResponseSchema", () => {
  it("translates a Zod object schema into JSON Schema, preserving enums and required fields", () => {
    const schema = z.object({
      outcome: z.enum(["APPROVED", "REJECTED"]),
      textContent: z.string().nullable().optional(),
    });

    const jsonSchema = toGeminiResponseSchema(schema) as {
      type: string;
      required?: string[];
      properties: { outcome: { enum: string[] } };
    };

    expect(jsonSchema.type).toBe("object");
    expect(jsonSchema.properties.outcome.enum).toEqual(["APPROVED", "REJECTED"]);
    expect(jsonSchema.required).toEqual(["outcome"]);
  });
});
