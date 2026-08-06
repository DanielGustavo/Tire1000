# Tire 1000

Plataforma onde estudantes do ENEM enviam fotos de redações modelo ENEM e recebem avaliação detalhada por competência.

## Language

**Correção**:
O serviço completo oferecido ao usuário: enviar uma foto de redação e receber Revisão + Avaliação. Consome 1 crédito.
_Avoid_: Avaliação (quando usado para o processo inteiro, não só a etapa final)

**Revisão**:
A etapa `VALIDATION`: um modelo de IA mais barato processa a foto, faz OCR do texto, checa legibilidade/iluminação/contagem de linhas, e retorna o texto da redação ou um motivo de rejeição.
_Avoid_: Validação (nome do enum de status no banco; o termo de produto é Revisão)

**Avaliação**:
A etapa `EVALUATION`: um modelo de IA mais caro processa o texto já revisado, pontuando cada uma das 5 competências do ENEM e gerando um parecer geral.
_Avoid_: Correção (esse é o processo completo, não a etapa)

**Eixo**:
A categoria temática à qual um Tema pertence (entidade `ThemeTopic`, tipo `TOPIC` no banco).
_Avoid_: Tópico

**Texto motivador**:
Material de apoio (texto ou imagem) apresentado junto a um Tema, usado pelo estudante como base pra escrever a redação (entidade `ReferenceText`, tipo `REFERENCE_TEXT` no banco).
_Avoid_: Texto de referência

**Fonte**:
De onde a informação de um Texto motivador (ou de uma imagem dentro dele) foi extraída — pode ser uma URL, uma citação, ou outra referência textual. Não é tipografia, apesar do campo no código se chamar `font`. Cada imagem de um Texto motivador pode ter uma fonte própria, independente da fonte do texto geral.
_Avoid_: Font
