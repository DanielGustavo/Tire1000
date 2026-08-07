import { Entity } from "./entity.js";

export const COMPETENCY_IDS = ["C1", "C2", "C3", "C4", "C5"] as const;

export type CompetencyId = (typeof COMPETENCY_IDS)[number];

export interface CompetencyScore {
  score: number;
  evaluationText: string;
}

export type EssayEvaluationScores = Record<CompetencyId, CompetencyScore> & {
  /** score = C1..C5 summed (max 1000); evaluationText = parecer geral consolidando as 5 competências. */
  final: CompetencyScore;
};

export interface EssayHighlight {
  /** Competência a que o trecho se refere — a competência que perdeu nota ou tem o ponto de atenção. */
  type: CompetencyId;
  anchorIndex: number;
  endIndex: number;
  /** Comentário do avaliador explicando por que esse trecho tirou nota ou merece atenção — exibido ao usuário só ao passar o mouse sobre o destaque. */
  textContent: string;
}

export interface EssayEvaluationProps {
  essayId: string;
  scores: EssayEvaluationScores;
  highlights: EssayHighlight[];
  createdAt: Date;
  updatedAt: Date;
}

export interface NewEssayEvaluationProps {
  essayId: string;
  scores: EssayEvaluationScores;
  highlights: EssayHighlight[];
}

/**
 * Resultado da Avaliação (ticket 07) — uma por Essay. Sem KSUID próprio: `id` é o `essayId`, já que
 * PK/SK (`EVALUATION#<essayId>`) endereçam o registro diretamente, sem colisão possível (uma Avaliação
 * por redação, diferente de EssayCost que precisa de KSUID próprio — ver spec's modelo de dados).
 */
export class EssayEvaluation extends Entity {
  declare readonly type: "ESSAY_EVALUATION";

  readonly essayId: string;
  readonly scores: EssayEvaluationScores;
  readonly highlights: EssayHighlight[];

  private constructor(props: EssayEvaluationProps) {
    super({ id: props.essayId, type: "ESSAY_EVALUATION", createdAt: props.createdAt, updatedAt: props.updatedAt });
    this.essayId = props.essayId;
    this.scores = props.scores;
    this.highlights = props.highlights;
  }

  static create({ essayId, scores, highlights }: NewEssayEvaluationProps): EssayEvaluation {
    const now = new Date();
    return new EssayEvaluation({ essayId, scores, highlights, createdAt: now, updatedAt: now });
  }

  static reconstitute(props: EssayEvaluationProps): EssayEvaluation {
    return new EssayEvaluation(props);
  }
}
