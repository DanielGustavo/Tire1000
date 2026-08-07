import { describe, expect, it } from "vitest";
import { validationResponseSchema } from "./schema.js";

describe("validationResponseSchema", () => {
  it("accepts an APPROVED response with textContent", () => {
    const result = validationResponseSchema.safeParse({ outcome: "APPROVED", textContent: "Texto da redação." });

    expect(result.success).toBe(true);
  });

  it("accepts a REJECTED response with reasons", () => {
    const result = validationResponseSchema.safeParse({ outcome: "REJECTED", reasons: ["ILLEGIBLE_HANDWRITING", "LOW_LIGHTING"] });

    expect(result.success).toBe(true);
  });

  it("accepts a response with only the required outcome field", () => {
    const result = validationResponseSchema.safeParse({ outcome: "APPROVED" });

    expect(result.success).toBe(true);
  });

  it("rejects a response with an outcome outside the enum", () => {
    const result = validationResponseSchema.safeParse({ outcome: "MAYBE" });

    expect(result.success).toBe(false);
  });

  it("rejects a response missing outcome", () => {
    const result = validationResponseSchema.safeParse({ textContent: "Texto." });

    expect(result.success).toBe(false);
  });

  it("rejects a reason outside the known EssayRejectionReason set", () => {
    const result = validationResponseSchema.safeParse({ outcome: "REJECTED", reasons: ["BLURRY_PHOTO"] });

    expect(result.success).toBe(false);
  });
});
