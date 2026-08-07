import type { EssayValidationGateway, EssayValidationResult } from "../../../domain/contracts/gateways/essay-validation-gateway.js";

/** Test double whose outcomes are scripted call-by-call via `queue*` — mirrors a real Gemini call succeeding or failing per attempt. */
export class InMemoryEssayValidationGateway implements EssayValidationGateway {
  readonly calls: Buffer[] = [];
  private readonly queue: (EssayValidationResult | Error)[] = [];

  queueApproved(input: Partial<Extract<EssayValidationResult, { outcome: "APPROVED" }>> = {}): void {
    this.queue.push({ outcome: "APPROVED", textContent: "Texto da redação.", tokens: 100, amountInCents: 1, ...input });
  }

  queueRejected(input: Partial<Extract<EssayValidationResult, { outcome: "REJECTED" }>> = {}): void {
    this.queue.push({ outcome: "REJECTED", reasons: ["ILLEGIBLE_HANDWRITING"], tokens: 100, amountInCents: 1, ...input });
  }

  queueFailure(error: Error = new Error("Gemini indisponível")): void {
    this.queue.push(error);
  }

  async validate(photo: Buffer): Promise<EssayValidationResult> {
    this.calls.push(photo);
    const next = this.queue.shift();
    if (!next) throw new Error("InMemoryEssayValidationGateway: no queued result for this call");
    if (next instanceof Error) throw next;
    return next;
  }
}
