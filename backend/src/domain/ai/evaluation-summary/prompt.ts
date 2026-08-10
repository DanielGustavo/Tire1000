import type { CompetencyId, CompetencyScore } from "../../entities/essay-evaluation.js";
import { EVALUATION_COMPETENCIES } from "../evaluation/competencies.js";

export interface BuildEvaluationSummaryPromptParams {
  themeTitle: string;
  scores: Record<CompetencyId, CompetencyScore>;
}

/**
 * Sexta chamada da Avaliação, rodando depois das 5 de competência (ver GeminiEssayEvaluationGateway) — só
 * recebe os 5 pares (competência + score + parecer) e o themeTitle, nunca o textContent da redação (ADR-0016):
 * os 5 pareceres já citam trechos relevantes quando útil, e reenviar a redação inteira encareceria/atrasaria
 * a Avaliação sem ganho claro.
 */
export function buildEvaluationSummaryPrompt({ themeTitle, scores }: BuildEvaluationSummaryPromptParams): string {
  const competencyReports = EVALUATION_COMPETENCIES.map(
    (competency) => `- ${competency.title} — nota ${scores[competency.id].score}: ${scores[competency.id].evaluationText}`,
  ).join("\n");

  return `# Papel e Objetivo
Você é um avaliador de redações do Enem. Sua tarefa é escrever o parecer geral de uma redação de um estudante sobre o tema "${themeTitle}", sintetizando num único texto os 5 pareceres de competência abaixo, já avaliados individualmente.

# Instruções
Use apenas os 5 pareceres de competência fornecidos abaixo como base — eles já citam trechos da redação quando relevante, então não invente nem presuma nenhuma informação sobre a redação que não esteja neles.

Não repita as 5 notas nem transcreva os 5 pareceres: identifique o padrão predominante entre eles — os pontos fortes recorrentes e as fragilidades mais relevantes — e condense isso num texto corrido novo, sem virar uma lista com um item por competência.

Os 5 pareceres de competência que o estudante já vê na tela são técnicos e não têm saudação nem despedida. Este parecer geral é diferente: fala diretamente com o estudante, num tom mais direto e humano. É o único parecer que abre reconhecendo algum ponto forte da redação e fecha com uma frase de incentivo — inclusive quando a nota geral é baixa.

Preencha \`evaluationText\` com esse parecer geral.

Pareceres de competência:
${competencyReports}

# Instruções finais
Releia os 5 pareceres acima e identifique o padrão predominante entre eles. Depois, escreva o parecer geral: abra reconhecendo algo que o estudante fez bem, no meio sintetize (sem listar competência por competência) os principais pontos a melhorar, e feche com uma frase de incentivo.`;
}
