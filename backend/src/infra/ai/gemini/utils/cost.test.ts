import { describe, expect, it } from "vitest";
import { estimateAmountInCents } from "./cost.js";

describe("estimateAmountInCents", () => {
  it("scales cost linearly with tokens for the given model's rate", () => {
    expect(estimateAmountInCents(1000, "gemini-3.6-flash")).toBe(0.15);
    expect(estimateAmountInCents(2000, "gemini-3.6-flash")).toBe(0.3);
  });

  it("returns 0 for 0 tokens", () => {
    expect(estimateAmountInCents(0, "gemini-3.6-flash")).toBe(0);
  });

  it("rounds to two decimal places", () => {
    expect(estimateAmountInCents(333, "gemini-3.6-flash")).toBe(0.05);
  });
});
