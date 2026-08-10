# Marcação de parágrafo no texto transcrito, fixada na origem (Revisão), via `\n\n`

Hoje não existe nenhuma convenção pra distinguir quebra de parágrafo (estrutural, decidida pelo estudante) de quebra de linha (artefato da largura do papel na escrita manuscrita) no texto transcrito pela Revisão — o `VALIDATION_PROMPT` só garante fidelidade ortográfica/gramatical, nada sobre estrutura de linhas. Sem essa distinção, a exibição da redação não consegue formatar parágrafos corretamente.

Decidimos corrigir na origem: o prompt de OCR passa a instruir o modelo a unir quebras de linha do papel em texto corrido, marcando só quebras de parágrafo reais com `\n\n`. **Consideramos** inferir parágrafos no frontend a partir do texto bruto atual, mas isso exigiria heurística sobre um formato que hoje não carrega essa informação de forma alguma — corrigir na origem é mais confiável que adivinhar depois.

Escolhemos `\n\n` em vez de `\n` simples como marcador porque o OCR não é 100% confiável: se o modelo devolver um `\n` avulso por engano (ex. resquício de quebra de linha do papel), o frontend trata como espaço em vez de quebra de parágrafo — um erro pontual do modelo não quebra a formatação visual de forma óbvia.

Redações já revisadas antes dessa mudança não são reprocessadas — continuam exibidas como texto corrido, sem a formatação de parágrafo.
