import type { CompetencyId } from "../../entities/essay-evaluation.js";

export interface MatrizLevel {
  level: 0 | 1 | 2 | 3 | 4 | 5;
  score: 0 | 40 | 80 | 120 | 160 | 200;
  /** Citação literal da Matriz de Referência do Enem (INEP/FGV) — ver docs/research/enem-criterios-avaliacao-redacao.md. */
  description: string;
}

export interface CompetencyDefinition {
  id: CompetencyId;
  title: string;
  matrizReferencia: MatrizLevel[];
  gradeEspecifica: string;
  additionalRules: string;
}

/**
 * Grade oficial das 5 competências do Enem, condensada a partir dos módulos de capacitação de
 * corretores do INEP/FGV (ciclo 2020) — ver docs/research/enem-criterios-avaliacao-redacao.md pras
 * citações completas e fontes. Cada nível vale 0/40/80/120/160/200 pontos; a nota final é a soma das
 * 5 competências (máx. 1000), avaliadas de forma independente (sem "arraste" entre elas).
 */
export const EVALUATION_COMPETENCIES: CompetencyDefinition[] = [
  {
    id: "C1",
    title: "Competência I — Domínio da modalidade escrita formal da Língua Portuguesa",
    matrizReferencia: [
      { level: 0, score: 0, description: "Demonstra desconhecimento da modalidade escrita formal da Língua Portuguesa" },
      {
        level: 1,
        score: 40,
        description:
          "Demonstra domínio precário da modalidade escrita formal da Língua Portuguesa, de forma sistemática, com diversificados e frequentes desvios gramaticais, de escolha de registro e de convenções da escrita",
      },
      {
        level: 2,
        score: 80,
        description:
          "Demonstra domínio insuficiente da modalidade escrita formal da Língua Portuguesa, com muitos desvios gramaticais, de escolha de registro e de convenções da escrita",
      },
      {
        level: 3,
        score: 120,
        description:
          "Demonstra domínio mediano da modalidade escrita formal da Língua Portuguesa e de escolha de registro, com alguns desvios gramaticais e de convenções da escrita",
      },
      {
        level: 4,
        score: 160,
        description:
          "Demonstra bom domínio da modalidade escrita formal da Língua Portuguesa e de escolha de registro, com poucos desvios gramaticais e de convenções da escrita",
      },
      {
        level: 5,
        score: 200,
        description:
          "Demonstra excelente domínio da modalidade escrita formal da Língua Portuguesa e de escolha de registro. Desvios gramaticais ou de convenções da escrita serão aceitos somente como excepcionalidade e quando não caracterizarem reincidência",
      },
    ],
    gradeEspecifica:
      "Combine dois eixos — estrutura sintática (inexistente/deficitária/regular/boa/excelente) e quantidade de desvios (muitos/alguns/poucos/no máximo dois): nível 0 = estrutura inexistente (não importa a quantidade de desvios); nível 1 = estrutura deficitária com muitos desvios; nível 2 = estrutura deficitária OU muitos desvios; nível 3 = estrutura regular E alguns desvios; nível 4 = estrutura boa E poucos desvios; nível 5 = estrutura excelente (no máximo 1 falha) E no máximo 2 desvios.",
    additionalRules:
      'Desempate: quando o texto mistura características de dois níveis diferentes, avalie no nível INFERIOR (ex.: estrutura sintática "regular" (nível 3) com "poucos desvios" (nível 4) é nível 3, não 4). Contagem de desvios: desvios de convenções da escrita, escolha vocabular e de registro contam uma única vez por vocábulo repetido; desvios gramaticais contam sempre que ocorrem, exceto quando o mesmo desvio se repete na exata mesma estrutura sintática. Nível 5 não significa nota 1000 (as competências são independentes) nem é atribuído por comparação com outros textos — julgue este texto isoladamente. Pontuação e erros de grafia em conectivos (ex.: "por tanto" separado, "oque" grudado) são sempre desta competência, nunca da Competência IV.',
  },
  {
    id: "C2",
    title:
      "Competência II — Compreensão da proposta e aplicação de conceitos das áreas de conhecimento para desenvolver o tema, dentro dos limites estruturais do texto dissertativo-argumentativo",
    matrizReferencia: [
      {
        level: 0,
        score: 0,
        description:
          "Fuga ao tema: o texto não trata sequer do assunto relacionado à frase temática (não apenas tangencia — ignora o assunto por completo)",
      },
      {
        level: 1,
        score: 40,
        description:
          "Apresenta o assunto, tangenciando o tema, ou demonstra domínio precário do texto dissertativo-argumentativo, com traços constantes de outros tipos textuais.",
      },
      {
        level: 2,
        score: 80,
        description:
          "Desenvolve o tema recorrendo à cópia de trechos dos textos motivadores ou apresenta domínio insuficiente do texto dissertativo-argumentativo, não atendendo à estrutura com proposição, argumentação e conclusão.",
      },
      {
        level: 3,
        score: 120,
        description:
          "Desenvolve o tema por meio de argumentação previsível e apresenta domínio mediano do texto dissertativo-argumentativo, com proposição, argumentação e conclusão.",
      },
      {
        level: 4,
        score: 160,
        description:
          "Desenvolve o tema por meio de argumentação consistente e apresenta bom domínio do texto dissertativo-argumentativo, com proposição, argumentação e conclusão.",
      },
      {
        level: 5,
        score: 200,
        description:
          "Desenvolve o tema por meio de argumentação consistente, a partir de um repertório sociocultural produtivo, e apresenta excelente domínio do texto dissertativo-argumentativo.",
      },
    ],
    gradeEspecifica:
      "Combine três eixos: (a) abordagem do tema — tangência (parcial) vs. completa; (b) partes do texto dissertativo-argumentativo presentes (introdução, argumentação, conclusão) e se alguma é embrionária (muito curta); (c) tipo de repertório sociocultural usado — baseado só nos textos motivadores / não legitimado (sem respaldo em áreas de conhecimento) / legitimado mas não pertinente ao tema / legitimado e pertinente com uso improdutivo / legitimado e pertinente com uso produtivo. Nível 1 = aglomerado de palavras OU traços constantes de outro tipo textual. A partir do nível 4, exige abordagem completa do tema e as 3 partes presentes (nenhuma embrionária) — o que diferencia nível 4 de 5 é só a qualidade do repertório (uso improdutivo vs. produtivo do repertório legitimado e pertinente).",
    additionalRules:
      'Repertório legitimado = informação com respaldo nas áreas de conhecimento (fatos/períodos históricos, autores/obras, estudos, personalidades, dados concretos) que NÃO esteja presente nos textos motivadores fornecidos ao estudante. Repertório baseado nos motivadores (paráfrase ou apropriação sem complementar) não conta como legitimado. Pertinência = o repertório se relaciona a pelo menos um elemento do tema (por sinônimo, hiperônimo ou hipônimo). Uso produtivo = o repertório é vinculado à discussão proposta, ainda que pontualmente. Textos com muitos trechos copiados dos motivadores (sem chegar a ser "Cópia" que zera a redação) não ultrapassam o nível 2. O título nunca conta para julgar fuga ao tema.',
  },
  {
    id: "C3",
    title: "Competência III — Seleção, relação, organização e interpretação de informações, fatos, opiniões e argumentos em defesa de um ponto de vista",
    matrizReferencia: [
      {
        level: 0,
        score: 0,
        description: "Apresenta informações, fatos e opiniões não relacionados ao tema e sem defesa de um ponto de vista.",
      },
      {
        level: 1,
        score: 40,
        description: "Apresenta informações, fatos e opiniões pouco relacionados ao tema ou incoerentes e sem defesa de um ponto de vista.",
      },
      {
        level: 2,
        score: 80,
        description:
          "Apresenta informações, fatos e opiniões relacionados ao tema, mas desorganizados ou contraditórios e limitados aos argumentos dos textos motivadores, em defesa de um ponto de vista.",
      },
      {
        level: 3,
        score: 120,
        description:
          "Apresenta informações, fatos e opiniões relacionados ao tema, limitados aos argumentos dos textos motivadores e pouco organizados, em defesa de um ponto de vista.",
      },
      {
        level: 4,
        score: 160,
        description: "Apresenta informações, fatos e opiniões relacionados ao tema, de forma organizada, com indícios de autoria, em defesa de um ponto de vista.",
      },
      {
        level: 5,
        score: 200,
        description:
          "Apresenta informações, fatos e opiniões relacionados ao tema proposto, de forma consistente e organizada, configurando autoria, em defesa de um ponto de vista.",
      },
    ],
    gradeEspecifica:
      "Combine dois eixos: projeto de texto (falhas: muitas/algumas/poucas, ou estratégico) e desenvolvimento das informações (nulo, de 1 informação, de algumas, da maior parte, ou de todo o texto). Nível 0 = tangente ao tema e sem direção; nível 1 = tangente ao tema e com direção, OU abordagem completa do tema e sem direção; nível 2 = projeto com muitas falhas E desenvolvimento nulo/de 1 informação (contradição grave não ultrapassa este nível); nível 3 = projeto com algumas falhas E desenvolvimento de algumas informações; nível 4 = projeto com poucas falhas E desenvolvimento da maior parte das informações; nível 5 = projeto estratégico E desenvolvimento das informações em todo o texto (deslizes pontuais são admitidos).",
    additionalRules:
      'Desempate: quando o texto cumpre plenamente o descritor de um nível mas só parcialmente o de um nível mais alto, prevalece o nível mais BAIXO. Textos tangentes ao tema (nível 0/1 da Competência II) não ultrapassam o nível 1 desta competência. Não avalie de novo aqui o uso de repertório (isso é da Competência II) nem o tipo textual (também da Competência II) — avalie apenas o projeto de texto (organização das ideias) e o desenvolvimento/interpretação dos argumentos.',
  },
  {
    id: "C4",
    title: "Competência IV — Conhecimento dos mecanismos linguísticos necessários para a construção da argumentação",
    matrizReferencia: [
      { level: 0, score: 0, description: "Não articula as informações." },
      { level: 1, score: 40, description: "Articula as partes do texto de forma precária." },
      {
        level: 2,
        score: 80,
        description: "Articula as partes do texto de forma insuficiente, com muitas inadequações, e apresenta repertório limitado de recursos coesivos.",
      },
      {
        level: 3,
        score: 120,
        description: "Articula as partes do texto de forma mediana, com inadequações, e apresenta repertório pouco diversificado de recursos coesivos.",
      },
      {
        level: 4,
        score: 160,
        description: "Articula as partes do texto, com poucas inadequações, e apresenta repertório diversificado de recursos coesivos.",
      },
      { level: 5, score: 200, description: "Articula bem as partes do texto e apresenta repertório diversificado de recursos coesivos." },
    ],
    gradeEspecifica:
      'Nível 0 = palavras e períodos justapostos e desconexos ao longo de todo o texto (ausência de articulação); nível 1 = presença rara de elementos coesivos inter/intraparágrafos E/OU excessivas repetições E/OU excessivas inadequações; nível 2 = presença pontual de elementos coesivos E/OU muitas repetições E/OU muitas inadequações (textos em monobloco não ultrapassam este nível); nível 3 = presença regular de elementos coesivos E/OU algumas repetições E/OU algumas inadequações; nível 4 = presença constante de elementos coesivos inter e intraparágrafos E/OU poucas repetições/inadequações — exige pelo menos 1 operador argumentativo entre parágrafos; nível 5 = presença expressiva de elementos coesivos inter e intraparágrafos E raras ou ausentes repetições E sem nenhuma inadequação — exige operador argumentativo entre parágrafos em pelo menos 2 momentos, e ao menos 1 elemento coesivo dentro de TODOS os parágrafos.',
    additionalRules:
      "Nível 5 não admite NENHUMA inadequação coesiva; se a única tentativa de coesão interparágrafos for inadequada, o texto nem atinge o nível 4. Pontuação é SEMPRE avaliada na Competência I, nunca aqui. Erros de grafia em conectivos (ex.: \"por tanto\" separado, \"oque\" grudado) são desvio ortográfico da Competência I, não falha de coesão — desde que a relação semântica pretendida pelo conectivo esteja correta.",
  },
  {
    id: "C5",
    title: "Competência V — Elaboração de proposta de intervenção para o problema abordado, respeitando os direitos humanos",
    matrizReferencia: [
      { level: 0, score: 0, description: "Não apresenta proposta de intervenção ou apresenta proposta não relacionada ao tema ou ao assunto." },
      { level: 1, score: 40, description: "Apresenta proposta de intervenção vaga, precária ou relacionada apenas ao assunto." },
      {
        level: 2,
        score: 80,
        description: "Elabora, de forma insuficiente, proposta de intervenção relacionada ao tema, ou não articulada com a discussão desenvolvida no texto.",
      },
      {
        level: 3,
        score: 120,
        description: "Elabora, de forma mediana, proposta de intervenção relacionada ao tema e articulada à discussão desenvolvida no texto.",
      },
      { level: 4, score: 160, description: "Elabora bem proposta de intervenção relacionada ao tema e articulada à discussão desenvolvida no texto." },
      {
        level: 5,
        score: 200,
        description: "Elabora muito bem proposta de intervenção, detalhada, relacionada ao tema e articulada à discussão desenvolvida no texto.",
      },
    ],
    gradeEspecifica:
      'Conte 5 elementos: AÇÃO (o que deve ser feito — pode ser nula se genérica/vaga), AGENTE (quem executa — nulo se não identificável; "nós"/1ª pessoa do plural com sujeito oculto conta como válido), MODO/MEIO (como se executa — não existe nulo), EFEITO (para quê — não existe nulo), DETALHAMENTO (exemplificação/explicação/justificativa de qualquer um dos outros 4, mesmo que nulos — não existe nulo). Nível 0 = ausência de proposta, cópia integral de proposta motivadora, proposta que desrespeita direitos humanos, ou proposta nem relacionada ao assunto; nível 1 = tangenciamento do tema OU só elemento(s) nulo(s) OU 1 elemento válido; nível 2 = 2 elementos válidos (estruturas condicionais com 2+ elementos válidos não ultrapassam este nível); nível 3 = 3 elementos válidos; nível 4 = 4 elementos válidos; nível 5 = 5 elementos válidos.',
    additionalRules:
      "Direitos humanos: nível 0 por desrespeito só se aplica quando a violação está NA proposta formulada pelo próprio estudante, não quando ele apenas relata violações de terceiros. Nível 0 desta competência equivale a proposta não relacionada nem ao assunto (como fuga ao tema); nível 1 equivale a tangenciar o tema; a partir do nível 2, a redação já aborda o tema por completo. A articulação entre proposta e o resto do texto já é avaliada na Competência III — não penalize de novo aqui por esse motivo, avalie apenas a proposta em si e seus elementos.",
  },
];

export function getCompetencyDefinition(id: CompetencyId): CompetencyDefinition {
  const competency = EVALUATION_COMPETENCIES.find((entry) => entry.id === id);
  if (!competency) throw new Error(`getCompetencyDefinition: competência desconhecida "${id}"`);
  return competency;
}
