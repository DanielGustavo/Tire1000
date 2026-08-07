import { GoogleGenAI, Type } from "@google/genai";
import type { EssayRejectionReason } from "../../domain/entities/essay.js";
import type { EssayValidationGateway, EssayValidationResult } from "../../domain/contracts/gateways/essay-validation-gateway.js";

const GEMINI_VALIDATION_MODEL = "gemini-2.5-flash";

// Rough estimate for gemini-2.5-flash's blended per-token price — good enough for the operator-facing
// cost tracking the spec asks for (story 30), not a billing-accurate figure. Tune as pricing changes.
const ESTIMATED_CENTS_PER_1000_TOKENS = 0.03;

const REJECTION_REASONS: EssayRejectionReason[] = ["ILLEGIBLE_HANDWRITING", "LOW_LIGHTING", "TOO_FEW_LINES", "TOO_MANY_LINES"];

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    outcome: { type: Type.STRING, enum: ["APPROVED", "REJECTED"] },
    textContent: { type: Type.STRING, nullable: true },
    reasons: { type: Type.ARRAY, items: { type: Type.STRING, enum: REJECTION_REASONS }, nullable: true },
  },
  required: ["outcome"],
};

const VALIDATION_PROMPT = `Você recebe a foto de uma redação manuscrita nos moldes do ENEM. Faça OCR do texto e avalie se a foto é aceitável.

Rejeite (outcome: "REJECTED") com um ou mais motivos em "reasons" se:
- ILLEGIBLE_HANDWRITING: a letra está ilegível a ponto de impedir o OCR confiável.
- LOW_LIGHTING: a iluminação da foto está ruim demais pra leitura.
- TOO_FEW_LINES: o texto tem menos de 7 linhas.
- TOO_MANY_LINES: o texto tem mais de 30 linhas.

Caso contrário, aprove (outcome: "APPROVED") e devolva o texto completo transcrito em "textContent".`;

interface GeminiValidationResponse {
  outcome: "APPROVED" | "REJECTED";
  textContent?: string | null;
  reasons?: EssayRejectionReason[] | null;
}

function estimateAmountInCents(tokens: number): number {
  return Math.round((tokens / 1000) * ESTIMATED_CENTS_PER_1000_TOKENS * 100) / 100;
}

export class GeminiEssayValidationGateway implements EssayValidationGateway {
  constructor(private readonly client: GoogleGenAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY ?? "" })) {}

  async validate(photo: Buffer): Promise<EssayValidationResult> {
    const response = await this.client.models.generateContent({
      model: GEMINI_VALIDATION_MODEL,
      contents: [
        {
          role: "user",
          parts: [{ text: VALIDATION_PROMPT }, { inlineData: { mimeType: "image/jpeg", data: photo.toString("base64") } }],
        },
      ],
      config: { responseMimeType: "application/json", responseSchema: RESPONSE_SCHEMA },
    });

    const parsed = JSON.parse(response.text ?? "{}") as GeminiValidationResponse;
    const tokens = response.usageMetadata?.totalTokenCount ?? 0;
    const amountInCents = estimateAmountInCents(tokens);

    if (parsed.outcome === "REJECTED") {
      return { outcome: "REJECTED", reasons: parsed.reasons ?? [], tokens, amountInCents };
    }

    return { outcome: "APPROVED", textContent: parsed.textContent ?? "", tokens, amountInCents };
  }
}
