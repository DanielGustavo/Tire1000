import type { EssayEvaluationGateway, EssayEvaluationResult } from "../../../domain/contracts/gateways/essay-evaluation-gateway.js";
import type { CompetencyScore, EssayEvaluationScores } from "../../../domain/entities/essay-evaluation.js";

const DEFAULT_COMPETENCY_SCORE: CompetencyScore = { score: 160, evaluationText: "Bom domínio, com poucos desvios." };

function defaultScores(): EssayEvaluationScores {
  return {
    C1: DEFAULT_COMPETENCY_SCORE,
    C2: DEFAULT_COMPETENCY_SCORE,
    C3: DEFAULT_COMPETENCY_SCORE,
    C4: DEFAULT_COMPETENCY_SCORE,
    C5: DEFAULT_COMPETENCY_SCORE,
    final: { score: 800, evaluationText: "Parecer geral padrão de teste." },
  };
}

export interface EvaluateCall {
  textContent: string;
  themeTitle: string;
}

/** Test double whose outcomes are scripted call-by-call via `queue*` — mirrors a real Gemini call succeeding or failing per attempt. */
export class InMemoryEssayEvaluationGateway implements EssayEvaluationGateway {
  readonly calls: EvaluateCall[] = [];
  private readonly queue: (EssayEvaluationResult | Error)[] = [];

  queueResult(overrides: Partial<EssayEvaluationResult> = {}): void {
    this.queue.push({ scores: defaultScores(), highlights: [], tokens: 500, amountInCents: 5, ...overrides });
  }

  queueFailure(error: Error = new Error("Gemini indisponível")): void {
    this.queue.push(error);
  }

  async evaluate(textContent: string, themeTitle: string): Promise<EssayEvaluationResult> {
    this.calls.push({ textContent, themeTitle });
    const next = this.queue.shift();
    if (!next) throw new Error("InMemoryEssayEvaluationGateway: no queued result for this call");
    if (next instanceof Error) throw next;
    return next;
  }
}
