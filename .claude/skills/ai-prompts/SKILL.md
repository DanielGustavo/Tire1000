---
name: ai-prompts
description: Prompt-writing conventions for this platform's Gemini AI calls, adapted from OpenAI's GPT-4.1 prompting guide. Use when writing a new prompt for an AI pipeline step (domain/ai/**/prompt.ts), editing or reviewing an existing platform prompt, or pairing a prompt with its Zod output schema.
---

# AI Prompts

Adapta o [GPT-4.1 Prompting Guide](../../../docs/research/gpt-4.1-prompting-guide.md) da OpenAI (fonte completa, com citações por seção) ao jeito que prompt roda *nesta* plataforma: chamada única ao Gemini com saída forçada num schema Zod — não um loop agêntico com tools. As seções do guia sobre workflows agênticos, tool-calling e formatos de diff (`apply_patch`, SEARCH/REPLACE) não se aplicam aqui e não são reproduzidas neste arquivo — só valem se um dia você escrever um prompt para um agente de verdade, não para um passo do pipeline de Correção.

## O formato de um prompt aqui

- `callGeminiModel` (`infra/ai/gemini/utils/call-model.ts`) manda **uma** string de prompt (+ imagem opcional) por chamada e força a resposta a bater com um schema Zod via `responseJsonSchema`. Não há conversa, não há tool use, não há múltiplos turnos.
- Convenção existente: par `prompt.ts` + `schema.ts` sob `domain/ai/<etapa>/` (ex.: `domain/ai/validation/`), com a escolha de modelo isolada em `infra/ai/gemini/<etapa>-model.ts`. Uma etapa nova (ex.: a futura Avaliação) segue esse mesmo layout.
- Como o SDK já garante a forma da saída, **não** escreva uma seção "# Formato de Saída" descrevendo a estrutura JSON — o schema já garante isso, é redundante. Em vez disso, garanta que cada campo do schema tenha uma instrução correspondente dizendo ao modelo como preenchê-lo (ver "Instruções ↔ campos do schema" abaixo). Essa é a maior divergência em relação ao esqueleto original da OpenAI, que assume saída em texto livre.

## Passos

1. **Schema primeiro.** Antes de escrever uma linha de prompt, feche o `schema.ts` da etapa (campos, enums, opcionalidade). O prompt existe para preencher esse contrato — escrevê-lo antes do schema é escrever às cegas.

2. **Sempre estruture com os cabeçalhos do esqueleto — não é reservado pra prompt complexo.** Guia da OpenAI (seção "Prompt Structure"):
   ```
   # Role and Objective
   # Instructions
   ## Sub-categories for more detailed instructions
   # Reasoning Steps
   # Output Format
   # Examples
   # Context
   # Final instructions and prompt to think step by step
   ```
   Todo prompt da plataforma usa pelo menos três seções fixas, traduzidas: `# Papel e Objetivo`, `# Instruções` e `# Instruções finais` — mesmo decisões binárias/curtas (ex.: Revisão). O que escala com a complexidade da decisão são as seções *opcionais*:
   - **Decisão binária/curta** (ex.: Revisão — aceitar ou rejeitar uma foto com um motivo): só as três seções fixas, sem subcategorias, Reasoning Steps ou Examples.
   - **Decisão multi-critério** (ex.: Avaliação — pontuar 5 competências do ENEM e gerar parecer): acrescente `## <subcategoria>` por competência dentro de `# Instruções`, e considere `# Examples` e/ou CoT (ver passo 5).

   Nunca inclua `# Output Format` (ver acima — o schema já garante a forma).

3. **Instruções ↔ campos do schema.** Todo campo do schema precisa de uma frase no prompt dizendo *quando* e *como* preenchê-lo — inclusive campos opcionais/nulos (diga explicitamente quando devolver `null`, senão o modelo tende a inventar um valor). Rode essa checagem campo a campo antes de considerar o prompt pronto.

4. **Delimitadores** (guia, seção "Delimiters"): Markdown é o ponto de partida — cabeçalhos por seção, crase para trechos citados. Use XML só quando aninhar exemplos com input/output dentro de uma seção de exemplos:
   ```xml
   <examples>
   <example1 type="Rejeição por iluminação">
   <input>...</input>
   <output>...</output>
   </example1>
   </examples>
   ```
   Evite JSON solto no corpo do prompt (fica verboso e exige escaping) — JSON aqui é papel do schema forçado pelo SDK, não do texto do prompt.

5. **Chain of Thought só quando há raciocínio de verdade a decompor.** Para classificação simples (Revisão), CoT é overhead sem ganho. Para avaliação multi-critério, adapte o template do guia (seção "Chain of Thought") — coloque como última instrução do prompt, depois do contexto:
   ```
   Primeiro, analise [dimensão 1] com cuidado. Depois, [dimensão 2]. [...]
   Por fim, [monte o parecer/pontuação final combinando as análises acima].
   ```
   Se o CoT sistematicamente erra do mesmo jeito, não reescreva o prompt inteiro — adicione uma instrução específica pro erro observado (o guia chama isso de auditar falhas e corrigir com instrução explícita, não com mais texto genérico).

6. **Contexto externo (Texto motivador, textos de referência): trave a origem do conhecimento.** Se o prompt embute um Texto motivador ou outro material de apoio que o modelo deve usar como base (ex.: julgar fuga ao tema), adapte o template do guia (seção "Long context" → "Tuning Context Reliance") pra deixar explícito se o modelo pode completar com conhecimento próprio ou só com o que foi fornecido:
   ```
   Use apenas o Texto motivador fornecido abaixo para julgar aderência ao tema. Se a informação não estiver lá, não presuma — trate como fora do escopo.
   ```
   Sem essa trava, o modelo mistura conhecimento de treino com o material fornecido de forma imprevisível.

7. **Resolva conflitos por posição, não por ênfase.** Segundo o guia, entre duas instruções que colidem o modelo tende a seguir a mais próxima do fim do prompt — se uma regra é a mais importante, coloque-a por último em vez de tentar reforçá-la com CAPS LOCK ou "IMPORTANTE:". Comece sem all-caps/súplicas; só recorra a isso se, depois de reordenar, o comportamento errado persistir.

8. **Vocabulário de domínio é o do `CONTEXT.md`.** Se o prompt menciona Revisão, Avaliação, Eixo, Texto motivador ou Fonte, use o termo canônico do glossário — não um sinônimo (`Validação`, `Tópico`, `texto de referência` são os que o `CONTEXT.md` explicitamente evita). Um prompt que usa o termo errado tanto confunde quem lê o código quanto arrisca vazar o termo errado pra saída do modelo (ex.: um `reason` ou parecer que cita "Tópico" em vez de "Eixo").

## Checklist antes de dar o prompt como pronto

- Todo campo do schema (incluindo os opcionais/nulos) tem instrução correspondente no prompt.
- Nenhuma seção "Formato de Saída" em prosa — o schema já cobre isso.
- Prompt tem pelo menos `# Papel e Objetivo`, `# Instruções` e `# Instruções finais`; seções extras (subcategorias, Examples, CoT) só entram se a decisão for multi-critério (passo 2).
- Se há contexto externo embutido (Texto motivador etc.), a instrução de "só use o que foi fornecido" está presente.
- Termos de domínio conferem com `CONTEXT.md`.
- Arquivo mora em `domain/ai/<etapa>/prompt.ts`, ao lado do `schema.ts` da mesma etapa.
