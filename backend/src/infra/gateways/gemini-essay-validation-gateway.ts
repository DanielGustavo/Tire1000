import { VALIDATION_PROMPT } from "../../domain/ai/validation/prompt.js";
import { validationResponseSchema } from "../../domain/ai/validation/schema.js";
import type { EssayValidationGateway, EssayValidationResult } from "../../domain/contracts/gateways/essay-validation-gateway.js";
import { callGeminiModel } from "../ai/gemini/utils/call-model.js";
import { VALIDATION_MODEL } from "../ai/gemini/validation-model.js";

export class GeminiEssayValidationGateway implements EssayValidationGateway {
  async validate(photo: Buffer): Promise<EssayValidationResult> {
    const { data, tokens, amountInCents } = await callGeminiModel({
      model: VALIDATION_MODEL,
      prompt: VALIDATION_PROMPT,
      image: photo,
      schema: validationResponseSchema,
    });

    if (data.outcome === "REJECTED") {
      return { outcome: "REJECTED", reasons: data.reasons ?? [], tokens, amountInCents };
    }

    return { outcome: "APPROVED", textContent: data.textContent ?? "", tokens, amountInCents };
  }
}
