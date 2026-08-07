export const VALIDATION_PROMPT = `Você recebe a foto de uma redação manuscrita nos moldes do ENEM. Faça OCR do texto e avalie se a foto é aceitável.

Rejeite (outcome: "REJECTED") com um ou mais motivos em "reasons" se:
- ILLEGIBLE_HANDWRITING: a letra está ilegível a ponto de impedir o OCR confiável.
- LOW_LIGHTING: a iluminação da foto está ruim demais pra leitura.
- TOO_FEW_LINES: o texto tem menos de 7 linhas.
- TOO_MANY_LINES: o texto tem mais de 30 linhas.

Caso contrário, aprove (outcome: "APPROVED") e devolva o texto completo transcrito em "textContent".`;
