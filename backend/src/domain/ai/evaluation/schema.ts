import { z } from "zod";

/** As 6 notas possíveis por competência, conforme a Matriz de Referência do Enem (0 a 5, valendo 0/40/80/120/160/200). */
export const competencyScoreSchema = z.union([
  z.literal(0),
  z.literal(40),
  z.literal(80),
  z.literal(120),
  z.literal(160),
  z.literal(200),
]);

/**
 * `quote` deve ser uma citação literal (substring exata) do texto avaliado — o gateway calcula
 * `anchorIndex`/`endIndex` localizando essa citação no texto original, em vez de pedir pro modelo contar
 * caracteres (pouco confiável), e depois descarta `quote` (o texto original já cobre isso). Ver
 * GeminiEssayEvaluationGateway/locateHighlight. `textContent` é o comentário do avaliador explicando por
 * que aquele trecho tirou nota ou merece atenção — é o que o usuário vê ao passar o mouse sobre o destaque.
 */
export const evaluationHighlightResponseSchema = z.object({
  quote: z.string().min(1),
  textContent: z.string().min(1),
});

export const evaluationCompetencyResponseSchema = z.object({
  score: competencyScoreSchema,
  evaluationText: z.string(),
  highlights: z.array(evaluationHighlightResponseSchema),
});

export type EvaluationCompetencyResponse = z.infer<typeof evaluationCompetencyResponseSchema>;
