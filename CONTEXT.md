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

**Parecer**:
O `evaluationText` de uma competência específica na Avaliação — explica por que aquele nível foi escolhido para aquela competência.
_Avoid_: comentário, feedback

**Parecer geral**:
O `evaluationText` do score `final` da Avaliação — um texto síntese que consolida os 5 pareceres de competência, gerado por sua própria chamada de IA. Não é concatenação dos 5 pareceres.
_Avoid_: score final (quando usado pro texto — "score" sozinho sugere só o número)

**Parágrafo**:
Unidade estrutural do texto da redação, definida pelo estudante — distinta de linha, que é só a quebra visual causada pela largura do papel na escrita manuscrita e não carrega significado. No texto transcrito pela Revisão, parágrafos são marcados por `\n\n`; quebras de linha do papel não são preservadas.
_Avoid_: linha, quebra de linha (usados como sinônimo de parágrafo — não são a mesma coisa)

**Eixo**:
A categoria temática à qual um Tema pertence (entidade `ThemeTopic`, tipo `TOPIC` no banco).
_Avoid_: Tópico

**Texto motivador**:
Material de apoio (texto ou imagem) apresentado junto a um Tema, usado pelo estudante como base pra escrever a redação (entidade `ReferenceText`, tipo `REFERENCE_TEXT` no banco).
_Avoid_: Texto de referência

**Destaque**:
Marca um trecho da redação que tirou nota ou merece atenção numa competência da Avaliação (entidade `EssayHighlight`). `anchorIndex`/`endIndex` localizam o trecho no texto original; `textContent` é o comentário do avaliador explicando o motivo, exibido só ao passar o mouse sobre o trecho.
_Avoid_: tratar `textContent` como a citação/trecho em si — ele é o comentário sobre o trecho, não o trecho.

**Fonte**:
De onde a informação de um Texto motivador (ou de uma imagem dentro dele) foi extraída — pode ser uma URL, uma citação, ou outra referência textual. Não é tipografia, apesar do campo no código se chamar `font`. Cada imagem de um Texto motivador pode ter uma fonte própria, independente da fonte do texto geral.
_Avoid_: Font
