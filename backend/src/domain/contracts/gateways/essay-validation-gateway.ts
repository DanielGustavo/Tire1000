import type { EssayRejectionReason } from "../../entities/essay.js";

export interface EssayValidationApproved {
  outcome: "APPROVED";
  /** OCR'd text of the essay, as read from the photo. */
  textContent: string;
  tokens: number;
  /** Estimated cost of this call, in cents — the gateway owns pricing knowledge for its model. */
  amountInCents: number;
}

export interface EssayValidationRejected {
  outcome: "REJECTED";
  reasons: EssayRejectionReason[];
  tokens: number;
  amountInCents: number;
}

export type EssayValidationResult = EssayValidationApproved | EssayValidationRejected;

/**
 * Gemini, wrapped for the fila de Revisão (ValidateEssay). A single prompt does OCR + legibility/lighting/
 * line-count checks and returns either the essay's text or the reasons it was rejected — never both.
 */
export interface EssayValidationGateway {
  validate(photo: Buffer): Promise<EssayValidationResult>;
}
