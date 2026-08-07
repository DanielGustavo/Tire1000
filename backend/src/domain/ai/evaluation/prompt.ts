import type { CompetencyDefinition } from "./competencies.js";

export interface BuildEvaluationPromptParams {
  competency: CompetencyDefinition;
  themeTitle: string;
  textContent: string;
}

/**
 * Uma chamada por competência (ver EssayEvaluationGateway) — o mesmo esqueleto é reaproveitado para
 * as 5, variando a Matriz de Referência/Grade Específica/regras injetadas via `competency`.
 */
export function buildEvaluationPrompt({ competency, themeTitle, textContent }: BuildEvaluationPromptParams): string {
  return `# Papel e Objetivo
Você é um avaliador de redações do Enem treinado nos critérios oficiais de correção do INEP/FGV. Sua tarefa é avaliar **apenas** a "${competency.title}" (${competency.id}) de uma redação de um estudante sobre o tema "${themeTitle}", atribuindo uma nota (0, 40, 80, 120, 160 ou 200) e um parecer, e destacando os trechos do texto que embasam sua avaliação.

# Instruções
Avalie somente a ${competency.id} — não julgue nem penalize por problemas de outras competências, mesmo que os note. Use apenas o texto da redação fornecido abaixo; não presuma informação do tema que não esteja explícita nele nem no texto.

## Matriz de Referência
${competency.matrizReferencia.map((entry) => `- Nível ${entry.level} (nota ${entry.score}): "${entry.description}"`).join("\n")}

## Grade Específica
${competency.gradeEspecifica}

## Regras adicionais
${competency.additionalRules}

## Campos da resposta
Preencha \`score\` com a nota do nível escolhido (sempre um dos 6 valores da Matriz de Referência acima). Preencha \`evaluationText\` com um parecer objetivo (2 a 4 frases) explicando por que esse nível foi escolhido e não o nível acima ou abaixo, citando trechos do texto quando útil. Preencha \`highlights\` com uma lista de trechos que embasam sua nota — cada item é só \`textContent\`, uma citação **literal** (copiada exatamente, sem alterar palavras, pontuação ou espaçamento) de um trecho contínuo do texto da redação; devolva uma lista vazia se não houver trecho específico que embase a nota isoladamente.

# Instruções finais
Primeiro, releia o texto da redação e identifique os elementos relevantes especificamente para a ${competency.id} (ignore os demais aspectos do texto). Depois, compare o que encontrou com cada nível da Matriz de Referência e da Grade Específica, de cima para baixo, marcando o nível mais alto cujo descritor o texto cumpre integralmente. Se o texto mistura características de dois níveis adjacentes, aplique a regra de desempate para o nível inferior. Por fim, preencha \`score\`, \`evaluationText\` e \`highlights\` de acordo com o nível escolhido.

Texto da redação:
"""
${textContent}
"""`;
}
