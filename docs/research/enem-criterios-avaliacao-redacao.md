# Critérios Oficiais do INEP para Avaliação da Redação do Enem

Nota de pesquisa sobre os materiais oficiais de capacitação de avaliadores da redação do Enem, publicados pelo INEP (em parceria com a Fundação Getulio Vargas, responsável pela correção) para o ciclo 2020. São seis PDFs — um "Módulo" do curso de capacitação de corretores para cada uma das cinco Competências da Matriz de Referência para Redação do Enem, mais um módulo dedicado às situações que anulam a redação (nota zero). Puxados como material-fonte de verdade (*ground truth*) para alinhar os prompts de IA deste repositório (`domain/ai`) que avaliam redações segundo os critérios oficiais do Enem.

> Fontes múltiplas: seis PDFs, um por seção abaixo. Cada afirmação é atribuída à seção/nível específico do documento de onde veio. Trechos entre aspas são citação literal do PDF (extraído via `pdftotext -layout`, preservando a redação original do INEP/FGV). O comentário conectivo está em português para seguir a convenção do resto do repositório (`CONTEXT.md`, `docs/adr/`, `docs/agents/`, todos em português). Os PDFs trazem um aviso de confidencialidade ("conteúdo sigiloso... curso de capacitação"), mas foram publicados publicamente pelo INEP no domínio `download.inep.gov.br`; citamos aqui apenas para fins de estudo dos critérios de correção, sem reproduzir o material integralmente.

Todas as seis Competências são avaliadas em **seis níveis** (0 a 5), cada um valendo respectivamente **0, 40, 80, 120, 160 e 200 pontos** — confirmado nos sumários dos módulos de Competência I a V (ex.: "4.2. Nível 1 (nota 40)" ... "4.6. Nível 5 (nota 200)"). A nota final da redação é a soma das cinco competências (máximo 1000 pontos), e as competências são avaliadas de forma **independente** — não há "arraste" de nota entre elas (Competência I, seção 3.5.4; Competência III, seção 2.1).

---

## 1. Situações que levam à nota zero

**Fonte:** https://download.inep.gov.br/educacao_basica/enem/downloads/2020/Situacoes_nota_zero.pdf ("Módulo 02 — Situações que levam à nota zero", FGV/INEP, 2020)

### Base normativa (Edital, Cartilha do Participante, Proposta de Redação)

O documento reproduz o **Edital 2019** (item 17.7), que lista as situações em que a banca pode atribuir nota 0:

> "17.7.1 não atender à proposta solicitada ou possua outra estrutura textual que não seja a estrutura dissertativo-argumentativa, o que configurará 'Fuga ao tema/não atendimento à estrutura dissertativo-argumentativa'; 17.7.2 não apresente texto escrito na Folha de Redação, que será considerada 'Em Branco'; 17.7.3 apresente até 7 (sete) linhas, qualquer que seja o conteúdo, o que configurará 'Texto insuficiente'; [...] 17.7.4 apresente impropérios, desenhos e outras formas propositais de anulação, o que configurará 'Anulada'; 17.7.5 apresente parte do texto deliberadamente desconectada com o tema proposto [...]; 17.7.6 apresente nome, assinatura, rubrica ou qualquer outra forma de identificação no espaço destinado exclusivamente ao texto da redação [...]; 17.7.7 esteja escrita predominante ou integralmente em língua estrangeira. 17.7.8 apresente letra ilegível, que impossibilite sua leitura por dois avaliadores independentes [...]."

A **Cartilha do Participante** (2018) resume as mesmas situações em linguagem mais direta, listando: fuga total ao tema; não obediência à estrutura dissertativo-argumentativa; extensão de até 7 linhas; cópia integral de texto(s) motivador(es)/Proposta de Redação/Caderno de Questões; impropérios, desenhos e outras formas propositais de anulação (números ou sinais gráficos fora do texto); parte deliberadamente desconectada do tema; assinatura/nome/apelido/rubrica fora do local designado; texto integralmente em língua estrangeira; e folha de redação em branco (mesmo com texto no rascunho).

### 1.1 Em Branco (EB) e Texto Insuficiente (TI) — não são atribuídas pelo avaliador

- **Em Branco**: redação "em que não há marcação alguma de texto verbal ou não verbal", identificada e retirada já na digitalização; se chegar ao avaliador por falha do processo, deve ser enviada ao "sistema de ocorrências de imagem" (seção 1.1.1).
- **Texto Insuficiente**: ocorre quando há "apenas 7 linhas ou menos ocupadas, seja por texto escrito, por desenhos e/ou por rasuras" (seção 1.1.2). **O título sempre conta na contagem de linhas.**

### 1.2 Hierarquia de verificação (ordem em que as situações devem ser checadas)

Quando uma redação se enquadra em mais de um motivo de anulação, prevalece o que estiver **mais ao topo** desta hierarquia (seção 1.2 e 8):

1. **Formas Elementares de Anulação (FEA)**
2. **Cópia**
3. **Fuga ao Tema**
4. **Não Atendimento ao Tipo Textual**
5. **Parte Desconectada (PD)**

### 1.3 Formas Elementares de Anulação (FEA) — capítulo 2

Grade específica final (capítulo 8) lista como FEA: **prova assinada**; **desenho** (qualquer desenho ou emoticon/emoji); **número isolado do corpo do texto**; **sinal gráfico que não é parte do corpo do texto**; **anulação proposital** (risco, rasura ou palavra sobrescrita em todo ou parte do texto, "desde que não restem mais de 7 linhas em Língua Portuguesa não anuladas"); **recusa explícita de escrever a redação**; **texto ilegível** (não há sequer configuração de letras; ou há letras mas não configuração de palavras; ou há só uma ou outra palavra legível); e **texto predominantemente em língua estrangeira**, "desde que não haja mais de 7 linhas em Língua Portuguesa".

O capítulo também documenta casos que **não** configuram FEA (seção 2.9): anulação de linhas em branco, destaques no título/texto, abandono/rasura de letra isolada, letra ou pontuação estilizada, vazamento de assinatura fora do espaço da redação, marcas de digitalização, sombra do gabarito.

### 1.4 Cópia — capítulo 3

Considera-se cópia "trechos que apresentarem sequência longa de palavras (3 palavras ou mais) idênticas às dos textos da Prova de Redação e/ou do Caderno de Questões", mesmo com alteração de singular/plural, tempo verbal, erros de grafia, supressão de palavras ou inversão de trechos — desde que mantida a mesma sequência de termos. **Paráfrase não é cópia.** O texto só é anulado como "Cópia" quando, descontadas as linhas copiadas, **não sobram mais de 7 linhas de produção própria** em Língua Portuguesa (seção 3, 3.1). Se sobrarem mais de 7 linhas próprias, a redação é corrigida normalmente, "inclusive para a identificação do cumprimento do tema" — os trechos copiados entram na avaliação de todas as Competências, **exceto a Competência V**, que tem uma exceção detalhada no módulo 7 (Comp. V).

### 1.5 Fuga ao Tema — capítulo 4

Distingue **tema** (abordagem completa dos elementos da frase temática) de **assunto** (abordagem parcial/tangente). "Apenas quando o texto do participante não trata sequer do assunto relacionado à frase temática ele deve ser anulado como fuga ao tema" (seção 4.1). O **título nunca é considerado** para validar o cumprimento do tema — mesmo que o assunto apareça só no título, e mesmo que o corpo do texto use anáforas retomando o título ("esse tema"), a redação é considerada fuga ao tema (seção 4.2).

### 1.6 Não Atendimento ao Tipo Textual — capítulo 5

Aplica-se quando o texto "não apresentar predominância de características do tipo dissertativo-argumentativo" (definição de tipo dissertativo-argumentativo citada de Garcez, 2016). A simples presença de um trecho narrativo ou de outro tipo textual não basta — é preciso que ele seja **predominante** (mais da metade das linhas); do contrário a redação é avaliada normalmente (seção 5, exemplos 66-67).

### 1.7 Parte Desconectada (PD) — capítulo 6

Só se aplica se a redação não foi anulada por nenhum motivo anterior na hierarquia. Engloba: **impropério ou ofensas** (palavras de baixo calão são *sempre* PD, mesmo em citação; ofensas comuns só contam se dirigidas com intenção clara de ofender); **zombaria**; **identificação do participante no corpo do texto** (mas *nome simples representando um personagem* não conta, e casos duvidosos vão para ocorrência pedagógica); **reflexão do participante sobre a prova/seu desempenho**; **recado ou bilhete desconectado**; **oração ou mensagem religiosa**; **mensagem política**; **trecho/texto sobre outro assunto**; **mensagem ou frase desconectada da proposta temática e do corpo do texto** (seção 6, capítulo 8).

### 1.8 Resumo esquemático (capítulo 9, Conclusão)

O documento fecha resumindo as premissas básicas para que uma redação seja corrigida: mais de 7 linhas escritas; em Língua Portuguesa; produção própria do participante; dentro do tema e do tipo textual; sem desenhos, impropérios ou outras formas de anulação, identificação ou tentativas de zombar do exame — cada quebra dessas premissas corresponde, na ordem, a FEA → Cópia → Fuga ao Tema → Não Atendimento ao Tipo Textual → Parte Desconectada.

---

## 2. Competência I — Domínio da modalidade escrita formal da Língua Portuguesa

**Fonte:** https://download.inep.gov.br/educacao_basica/enem/downloads/2020/Competencia_1.pdf ("Módulo 03 — Competência I", FGV/INEP, 2020)

### Matriz de Referência (descrição literal por nível, seção 1.1)

| Nível | Nota | Descrição literal (Matriz de Referência) |
|---|---|---|
| 0 | 0 | "Demonstra desconhecimento da modalidade escrita formal da Língua Portuguesa" |
| 1 | 40 | "Demonstra domínio precário da modalidade escrita formal da Língua Portuguesa, de forma sistemática, com diversificados e frequentes desvios gramaticais, de escolha de registro e de convenções da escrita" |
| 2 | 80 | "Demonstra domínio insuficiente da modalidade escrita formal da Língua Portuguesa, com muitos desvios gramaticais, de escolha de registro e de convenções da escrita" |
| 3 | 120 | "Demonstra domínio mediano da modalidade escrita formal da Língua Portuguesa e de escolha de registro, com alguns desvios gramaticais e de convenções da escrita" |
| 4 | 160 | "Demonstra bom domínio da modalidade escrita formal da Língua Portuguesa e de escolha de registro, com poucos desvios gramaticais e de convenções da escrita" |
| 5 | 200 | "Demonstra excelente domínio da modalidade escrita formal da Língua Portuguesa e de escolha de registro. Desvios gramaticais ou de convenções da escrita serão aceitos somente como excepcionalidade e quando não caracterizarem reincidência" |

### Grade Específica (seção 1.2) — dois eixos: estrutura sintática + desvios

| Nível | Descritor operacional |
|---|---|
| 0 | Estrutura sintática **inexistente** (independentemente da quantidade de desvios) |
| 1 | Estrutura sintática **deficitária** com **muitos** desvios |
| 2 | Estrutura sintática **deficitária** OU **muitos** desvios |
| 3 | Estrutura sintática **regular** E **alguns** desvios |
| 4 | Estrutura sintática **boa** E **poucos** desvios |
| 5 | Estrutura sintática **excelente** (no máximo, uma falha) E, no máximo, **dois** desvios |

Quatro possibilidades de estrutura sintática (deficitária, regular, boa, excelente) e quantidade de desvios (muitos, alguns, poucos, no máximo dois).

### Regra de desempate entre níveis (seção 1.3, "Dinâmica de avaliação")

"Textos que tenham características de dois níveis diferentes devem ser avaliados no nível inferior." Exemplo dado literalmente: um texto com "estrutura sintática regular" (nível 3) e "poucos desvios" (nível 4) é avaliado no **nível 3** — a estrutura sintática prevalece porque aparece primeiro no descritor mais restritivo.

### Regra de contagem de desvios (Atenção, próxima ao fim do módulo)

"Desvios de convenções da escrita, de escolha vocabular e de escolha de registro devem ser contabilizados uma única vez para cada vocábulo com desvio que se repete" (ex.: "brasil" minúsculo repetido conta 1 vez). Já **desvios gramaticais devem ser considerados sempre que ocorrerem**, exceto quando o mesmo desvio se repete na exata mesma estrutura sintática (ex.: "à usuários" repetido na mesma construção conta uma vez).

### Considerações sobre o nível 5 (seção 3.5.4)

O texto ressalta explicitamente três avisos aos avaliadores: (1) nível 5 na Competência I **não implica** nota 1000 — as competências são independentes, e nota máxima na Comp. I exige nota máxima também nas demais para alcançar 1000; (2) uma redação "melhor que a anterior" não é motivo, por si só, para atribuir nível 5 — a avaliação não é comparativa; (3) letra pequena preenchendo toda a folha não deve, por si só, elevar automaticamente o nível — exige leitura mais cuidadosa.

---

## 3. Competência II — Compreensão da proposta e aplicação de conceitos das áreas de conhecimento

**Fonte:** https://download.inep.gov.br/educacao_basica/enem/downloads/2020/Competencia_2.pdf ("Módulo 04 — Competência II", FGV/INEP, 2020)

### Matriz de Referência (seção 1.1) — descrição literal

Descritor de topo: "Compreender a proposta de redação e aplicar conceitos das várias áreas de conhecimento para desenvolver o tema, dentro dos limites estruturais do texto dissertativo-argumentativo em prosa."

| Nível | Nota | Descrição literal |
|---|---|---|
| 1 | 40 | "Apresenta o assunto, tangenciando o tema, ou demonstra domínio precário do texto dissertativo-argumentativo, com traços constantes de outros tipos textuais." |
| 2 | 80 | "Desenvolve o tema recorrendo à cópia de trechos dos textos motivadores ou apresenta domínio insuficiente do texto dissertativo-argumentativo, não atendendo à estrutura com proposição, argumentação e conclusão." |
| 3 | 120 | "Desenvolve o tema por meio de argumentação previsível e apresenta domínio mediano do texto dissertativo-argumentativo, com proposição, argumentação e conclusão." |
| 4 | 160 | "Desenvolve o tema por meio de argumentação consistente e apresenta bom domínio do texto dissertativo-argumentativo, com proposição, argumentação e conclusão." |
| 5 | 200 | "Desenvolve o tema por meio de argumentação consistente, a partir de um repertório sociocultural produtivo, e apresenta excelente domínio do texto dissertativo-argumentativo." |

(O nível 0 desta Competência corresponde à Fuga ao Tema, tratada como situação de nota zero no Módulo 02 — não há descritor de nível 0 próprio na Comp. II.)

### Grade Específica (capítulo 2) — três eixos combinados

Resumo da grade (Competência II, nível 1 a 5): **(a) abordagem do tema** (tangência vs. completa), **(b) tipo textual/partes do texto** (introdução, argumentação, conclusão — nenhuma/uma/nenhuma embrionária) e **(c) tipo de repertório** (baseado nos motivadores / não legitimado / legitimado mas não pertinente / legitimado + pertinente com uso improdutivo / legitimado + pertinente com uso produtivo). Nível 1 = "Texto composto por aglomerado de palavras OU traços constantes de outros tipos textuais". Do nível 4 em diante, exige-se abordagem completa do tema E 3 partes do texto (nenhuma embrionária) — o que diferencia nível 4 de 5 é exclusivamente a qualidade do repertório (uso improdutivo vs. produtivo do repertório legitimado e pertinente).

### Definições-chave (seção 2.1)

- **Tangência**: "abordagem incompleta dos elementos relacionados" ao tema; textos tangentes "resvalam" no tema.
- **Partes embrionárias**: quando introdução, argumentação e/ou conclusão "são muito curtas devido a sua pouca produção".
- **Repertório sociocultural**: "toda e qualquer informação, fato, citação ou experiência vivida que [...] contribui como argumento para a discussão", citando Cantarin, Bertucci & Almeida (2016): "provas concretas (dados ou fatos sobre o tema), exemplos [...], autoridades [...], lógica [...] e senso comum".
- **Repertório legitimado**: usa informações "COM respaldo nas Áreas do Conhecimento" — conceitos, fatos/períodos históricos reconhecidos, autores/obras, áreas de conhecimento e profissionais, estudos/pesquisas, personalidades conhecidas, meios de comunicação conhecidos. Atenção: "informações [...] não serão consideradas repertório legitimado se estiverem presentes nos textos motivadores."
- **Repertório não legitimado**: usa informações "SEM respaldo nas Áreas do Conhecimento".
- **Repertório baseado nos textos motivadores**: paráfrase próxima do original ou apropriação sem complementar com informação externa.
- **Textos com muitos trechos de cópia dos motivadores**: mesmo sem serem "Cópia" (nota zero — >7 linhas próprias), "não devem ultrapassar" o nível 2 da Comp. II.
- **Pertinência**: associação do repertório legitimado a pelo menos um dos elementos do tema (por sinônimo, hiperônimo ou hipônimo).
- **Uso produtivo**: quando o participante "vincula esse repertório à discussão proposta, ainda que de forma pontual."

---

## 4. Competência III — Seleção, relação, organização e interpretação de argumentos

**Fonte:** https://download.inep.gov.br/educacao_basica/enem/downloads/2020/Competencia_3.pdf ("Módulo 05 — Competência III", FGV/INEP, 2020)

### Matriz de Referência (seção 2) — descrição literal

Descritor de topo: "Selecionar, relacionar, organizar e interpretar informações, fatos, opiniões e argumentos em defesa de um ponto de vista."

| Nível | Nota | Descrição literal |
|---|---|---|
| 0 | 0 | "Apresenta informações, fatos e opiniões não relacionados ao tema e sem defesa de um ponto de vista." |
| 1 | 40 | "Apresenta informações, fatos e opiniões pouco relacionados ao tema ou incoerentes e sem defesa de um ponto de vista." |
| 2 | 80 | "Apresenta informações, fatos e opiniões relacionados ao tema, mas desorganizados ou contraditórios e limitados aos argumentos dos textos motivadores, em defesa de um ponto de vista." |
| 3 | 120 | "Apresenta informações, fatos e opiniões relacionados ao tema, limitados aos argumentos dos textos motivadores e pouco organizados, em defesa de um ponto de vista." |
| 4 | 160 | "Apresenta informações, fatos e opiniões relacionados ao tema, de forma organizada, com indícios de autoria, em defesa de um ponto de vista." |
| 5 | 200 | "Apresenta informações, fatos e opiniões relacionados ao tema proposto, de forma consistente e organizada, configurando autoria, em defesa de um ponto de vista." |

Nota importante da própria seção 2: os descritores de nível 0 ("não relacionados ao tema") e nível 1 ("pouco relacionados ao tema") da Matriz são interpretados, na prática de correção, como **igualmente "tangentes"** — textos tangentes ao tema (Comp. II) não podem ultrapassar o **nível 1** da Competência III.

### Grade Específica (capítulo 3) — dois eixos: projeto de texto + desenvolvimento

| Nível | Descritor operacional |
|---|---|
| 0 | Tangente ao tema **e sem direção** |
| 1 | Tangente ao tema **e com direção** OU Abordagem completa do tema **e sem direção** |
| 2 | Projeto de texto com **muitas falhas** E desenvolvimento nulo/de apenas 1 informação (textos com contradição grave não ultrapassam este nível) |
| 3 | Projeto de texto com **algumas falhas** E desenvolvimento de **algumas** informações |
| 4 | Projeto de texto com **poucas falhas** E desenvolvimento da **maior parte** das informações |
| 5 | Projeto de texto **estratégico** E desenvolvimento das informações **em todo o texto** (admitem-se deslizes pontuais) |

Regra de desempate (idêntica em espírito à da Competência I): quando a redação cumpre o descritor de um nível mais baixo mas apenas parcialmente o de um nível mais alto, prevalece o **nível mais baixo**.

### Delimitação de fronteiras com outras Competências (seção 2.1)

O módulo é explícito em evitar dupla penalização: o **uso de repertório** já é avaliado na Competência II e não deve ser cobrado de novo aqui, ainda que o descritor da Matriz cite "limitados aos argumentos dos textos motivadores" nos níveis 2 e 3; o **tipo textual** já avaliado na Comp. II não é reavaliado; a relação entre **Comp. III e IV**: III avalia "o projeto de texto e o desenvolvimento das ideias", IV avalia "a superfície textual" (marcas linguísticas); a relação com a **Comp. V**: a articulação entre proposta de intervenção e discussão do texto é avaliada aqui na III (via relação com o tema), não na V.

---

## 5. Competência IV — Mecanismos linguísticos para a construção da argumentação (coesão)

**Fonte:** https://download.inep.gov.br/educacao_basica/enem/downloads/2020/Competencia_4.pdf ("Módulo 06 — Competência IV", FGV/INEP, 2020)

### Matriz de Referência (seção 3) — descrição literal

Descritor de topo: "Demonstrar conhecimento dos mecanismos linguísticos necessários para a construção da argumentação."

| Nível | Nota | Descrição literal |
|---|---|---|
| 0 | 0 | "Não articula as informações." |
| 1 | 40 | "Articula as partes do texto de forma precária." |
| 2 | 80 | "Articula as partes do texto de forma insuficiente, com muitas inadequações, e apresenta repertório limitado de recursos coesivos." |
| 3 | 120 | "Articula as partes do texto de forma mediana, com inadequações, e apresenta repertório pouco diversificado de recursos coesivos." |
| 4 | 160 | "Articula as partes do texto, com poucas inadequações, e apresenta repertório diversificado de recursos coesivos." |
| 5 | 200 | "Articula bem as partes do texto e apresenta repertório diversificado de recursos coesivos." |

### Grade Específica (capítulo 5)

| Nível | Descritor operacional |
|---|---|
| 0 | "Palavras e períodos justapostos e desconexos ao longo de todo o texto, o que demonstra ausência de articulação." |
| 1 | "Presença rara de elementos coesivos inter e/ou intraparágrafos E/OU excessivas repetições E/OU excessivas inadequações." |
| 2 | "Presença pontual de elementos coesivos inter e/ou intraparágrafos E/OU muitas repetições E/OU muitas inadequações." (textos em forma de monobloco não ultrapassam este nível) |
| 3 | "Presença regular de elementos coesivos inter E/OU intraparágrafos E/OU algumas repetições E/OU algumas inadequações." |
| 4 | "Presença constante de elementos coesivos inter\* e intraparágrafos E/OU poucas repetições E/OU poucas inadequações." — \*exige elemento coesivo do tipo "operador argumentativo" entre parágrafos em pelo menos 1 momento do texto. |
| 5 | "Presença expressiva de elementos coesivos inter\*\* e intraparágrafos\*\* E raras ou ausentes repetições E sem inadequação." — \*\*exige operador argumentativo entre parágrafos em pelo menos 2 momentos, e pelo menos 1 elemento coesivo de qualquer tipo dentro de **todos** os parágrafos.

O nível 5 não admite **nenhuma** inadequação coesiva; se a única tentativa de coesão interparágrafos for inadequada, o texto não atinge sequer o nível 4 (que exige ao menos um operador argumentativo interparágrafos válido).

### Fronteira com Competência I e III (capítulo 4)

O módulo resolve explicitamente uma ambiguidade recorrente: **pontuação é sempre avaliada na Competência I**, nunca na IV, porque é regida por convenção gramatical e afeta a estrutura sintática. Do mesmo modo, **erros de grafia em conectivos** (ex.: escrever "por tanto" separado em vez de "portanto", ou "oque" grudado) são desvio ortográfico da **Competência I**, não falha de coesão da Competência IV — desde que a relação semântica pretendida pelo conectivo esteja correta. Resumo esquemático do próprio documento: Competência IV = "superfície do texto / recursos coesivos"; Competência III = "estrutura profunda do texto"; Competência I = "superfície do texto / modalidade".

---

## 6. Competência V — Proposta de intervenção respeitando os direitos humanos

**Fonte:** https://download.inep.gov.br/educacao_basica/enem/downloads/2020/Competencia_5.pdf ("Módulo 07 — Competência V", FGV/INEP, 2020)

### Matriz de Referência (seção 2) — descrição literal

Descritor de topo: "Elaborar proposta de intervenção para o problema abordado, respeitando os direitos humanos."

| Nível | Nota | Descrição literal |
|---|---|---|
| 0 | 0 | "Não apresenta proposta de intervenção ou apresenta proposta não relacionada ao tema ou ao assunto." |
| 1 | 40 | "Apresenta proposta de intervenção vaga, precária ou relacionada apenas ao assunto." |
| 2 | 80 | "Elabora, de forma insuficiente, proposta de intervenção relacionada ao tema, ou não articulada com a discussão desenvolvida no texto." |
| 3 | 120 | "Elabora, de forma mediana, proposta de intervenção relacionada ao tema e articulada à discussão desenvolvida no texto." |
| 4 | 160 | "Elabora bem proposta de intervenção relacionada ao tema e articulada à discussão desenvolvida no texto." |
| 5 | 200 | "Elabora muito bem proposta de intervenção, detalhada, relacionada ao tema e articulada à discussão desenvolvida no texto." |

### Grade Específica (capítulo 3) — cinco elementos contáveis

"Elementos: AÇÃO + AGENTE + MODO/MEIO + EFEITO + DETALHAMENTO."

| Nível | Descritor operacional |
|---|---|
| 0 | Ausência de proposta ou cópia integral de proposta OU proposta que desrespeita os direitos humanos OU proposta não relacionada sequer ao assunto |
| 1 | Tangenciamento do tema OU apenas elemento(s) nulo(s) OU 1 elemento válido |
| 2 | **2 elementos válidos** (estruturas condicionais com 2+ elementos válidos não ultrapassam este nível) |
| 3 | **3 elementos válidos** |
| 4 | **4 elementos válidos** |
| 5 | **5 elementos válidos** |

### Definição dos 5 elementos (seção 2.4)

- **Ação** — "ação prática apontada [...] como necessária para a solução do problema" ("O que deve ser feito?"). Pode ser **nula** (não contabilizada) se genérica/vaga/pouco interventiva — ex.: "medidas são necessárias para atenuar a problemática".
- **Agente** — "ator social apontado para executar a ação" ("Quem executa?"). É **nulo** se expresso por termos que não permitem identificação precisa (ex.: "alguém", "ninguém", "você", imperativo sem vocativo). Atenção: a partir de 2019, "nós" e a desinência verbal de 1ª pessoa do plural (sujeito oculto) passam a ser considerados **elementos válidos**.
- **Modo/meio** — "maneira e/ou recursos pelos quais a ação é realizada" ("Como se executa?/Por meio do quê?"). **Não existe modo/meio nulo.**
- **Efeito** — "resultados pretendidos ou alcançados pela ação proposta" ("Para quê?"), expresso como finalidade, consequência ou conclusão. **Não existe efeito nulo.**
- **Detalhamento** — "acrescenta informações à ação, ao agente, ao modo/meio ou ao efeito" (exemplificação, explicação, justificativa ou contextualização). **Não existe detalhamento nulo**, e pode se relacionar mesmo a uma ação/agente considerados nulos.

### Direitos humanos (seção 2.2)

O nível 0 por desrespeito aos direitos humanos aplica-se apenas quando a violação está **na proposta de intervenção formulada pelo próprio participante**, não quando é apenas relatada como posição de terceiros. Fundamenta-se nas Diretrizes Nacionais para Educação em Direitos Humanos (Resolução nº 1/2012), Declaração Universal dos Direitos Humanos, Carta da ONU e Declaração de Durban, cobrindo os princípios de "dignidade humana; igualdade de direitos; reconhecimento e valorização das diferenças e diversidades; laicidade do Estado; democracia na educação; transversalidade, vivência e globalidade; e sustentabilidade socioambiental."

### Relação com Competência II e III (seção 2.1)

Nível 0 da Comp. V ⟷ proposta não relacionada nem ao assunto (equivalente à fuga ao tema); nível 1 ⟷ texto tangente ao tema (Comp. II); a partir do nível 2, exige-se abordagem completa do tema. A articulação entre proposta de intervenção e discussão do texto é avaliada na **Competência III** (não duplicada aqui), evitando penalizar o mesmo aspecto duas vezes.

---

## Observações para uso no `domain/ai`

- Todos os seis PDFs foram recuperados com sucesso via download direto (`curl` + `pdftotext -layout`) — nenhum ficou indisponível.
- Os PDFs são material de treinamento de corretores (não a Matriz de Referência "oficial" resumida em uma página), então trazem exemplos extensos de redações reais anonimizadas, que não foram reproduzidos aqui — apenas os descritores literais das grades e as regras de desempate/fronteira entre competências, que são o conteúdo normativo relevante para calibrar prompts.
- Pontos que merecem atenção especial ao revisar prompts existentes: (1) a regra de **desempate para o nível inferior** quando uma redação mistura características de dois níveis (Comp. I e III); (2) a **hierarquia de verificação** de nota zero (FEA > Cópia > Fuga ao Tema > Não Atendimento ao Tipo Textual > Parte Desconectada); (3) a distinção entre **assunto** (tangente) e **tema** (completo), que atravessa Comp. II, III e V; (4) a fronteira explícita entre Comp. I e IV quanto a pontuação e ortografia de conectivos; (5) os 5 elementos contáveis da Comp. V (ação/agente/modo-meio/efeito/detalhamento) e suas regras de nulidade.

---

**Fontes consultadas (6 PDFs, INEP/FGV, ciclo 2020):**
1. https://download.inep.gov.br/educacao_basica/enem/downloads/2020/Situacoes_nota_zero.pdf
2. https://download.inep.gov.br/educacao_basica/enem/downloads/2020/Competencia_1.pdf
3. https://download.inep.gov.br/educacao_basica/enem/downloads/2020/Competencia_2.pdf
4. https://download.inep.gov.br/educacao_basica/enem/downloads/2020/Competencia_3.pdf
5. https://download.inep.gov.br/educacao_basica/enem/downloads/2020/Competencia_4.pdf
6. https://download.inep.gov.br/educacao_basica/enem/downloads/2020/Competencia_5.pdf

Acessados em 2026-08-07.
