# GPT-4.1 Prompting Guide (OpenAI Cookbook)

Nota de pesquisa sobre o guia oficial de prompting da OpenAI para a família GPT-4.1, publicado no OpenAI Cookbook. Puxado como material-fonte para uma futura skill do Claude Code que ajude a escrever prompts seguindo a orientação oficial da OpenAI (mesmo raciocínio se aplica, em boa parte, a outros modelos — mas as citações abaixo são estritamente o que a OpenAI afirma nesta página, atribuídas por seção).

> Fonte única: esta página é o único material consultado. Toda afirmação abaixo é atribuída à seção específica da página de onde veio. Trechos entre aspas ou em bloco de código são citação/paráfrase próxima do original em inglês; o comentário conectivo está em português para seguir a convenção do resto do repositório (`CONTEXT.md`, `docs/adr/`, `docs/agents/`, todos em português).

## Introdução (texto antes da seção "1. Agentic Workflows")

- A família GPT-4.1 é descrita como um avanço significativo sobre o GPT-4o em coding, instruction following e long context.
- Boas práticas antigas continuam válidas (exemplos de contexto, instruções específicas e claras, induzir planejamento via prompting), **mas** a OpenAI avisa que devs devem esperar precisar migrar prompts: "GPT-4.1 is trained to follow instructions more closely and more literally than its predecessors, which tended to more liberally infer intent from user and system prompts." Isso tem uma contrapartida positiva: o modelo é "highly steerable and responsive to well-specified prompts" — se o comportamento observado diverge do esperado, geralmente basta uma frase firme e inequívoca esclarecendo o comportamento desejado.
- A OpenAI recomenda tratar prompt engineering como disciplina empírica: construir evals informativos e iterar com frequência, já que "no advice is one-size-fits-all."

## 1. Agentic Workflows

Seção de abertura: GPT-4.1 é indicado para workflows agênticos. O harness agêntico da OpenAI atinge estado da arte entre modelos non-reasoning no SWE-bench Verified, resolvendo 55% dos problemas.

### System Prompt Reminders

Para workflows agênticos, a OpenAI recomenda incluir **três tipos de lembretes** em todo prompt de agente (otimizados originalmente para coding agêntico, mas adaptáveis a qualquer uso agêntico):

1. **Persistence** — garante que o modelo entenda que está numa interação multi-turno e evita que devolva o controle ao usuário prematuramente:
   ```
   You are an agent - please keep going until the user's query is completely resolved, before ending your turn and yielding back to the user. Only terminate your turn when you are sure that the problem is solved.
   ```
2. **Tool-calling** — incentiva o uso pleno das ferramentas disponíveis, reduzindo alucinação/chute:
   ```
   If you are not sure about file content or codebase structure pertaining to the user's request, use your tools to read files and gather the relevant information: do NOT guess or make up an answer.
   ```
3. **Planning** [opcional] — induz o modelo a planejar e refletir explicitamente em texto entre chamadas de ferramenta, em vez de só encadear tool calls:
   ```
   You MUST plan extensively before each function call, and reflect extensively on the outcomes of the previous function calls. DO NOT do this entire process by making function calls only, as this can impair your ability to solve the problem and think insightfully.
   ```

Segundo a OpenAI, essas três instruções juntas aumentaram o score interno de SWE-bench Verified em quase 20%, e "transform the model from a chatbot-like state into a much more 'eager' agent, driving the interaction forward autonomously and independently."

### Tool Calls

- Recomendação explícita: usar o campo `tools` da API da OpenAI em vez de injetar descrições de ferramentas manualmente no prompt e escrever um parser próprio para tool calls (prática que alguns devs reportaram no passado). Isso minimiza erros e mantém o modelo "in distribution" durante trajetórias de tool-calling — a OpenAI observou +2% no SWE-bench Verified usando tool descriptions via API vs. injetadas manualmente no system prompt.
- Nomear ferramentas de forma clara quanto ao propósito, e escrever descrições detalhadas no campo `description` — tanto da tool quanto de cada parâmetro.
- Se a ferramenta for complexa e você quiser dar exemplos de uso, a recomendação é criar uma seção `# Examples` no system prompt (não colocar exemplos dentro do campo `description`, que deve ficar "thorough but relatively concise"). Exemplos ajudam a indicar quando usar a tool, se incluir texto pro usuário junto da tool call, e quais parâmetros cabem em quais inputs.
- Menciona o recurso "Generate Anything" no Prompt Playground como ponto de partida para novas definições de tool.

### Prompting-Induced Planning & Chain-of-Thought

- GPT-4.1 **não é** um reasoning model — não produz chain-of-thought interno antes de responder — mas o prompt pode induzir um plano explícito passo a passo usando a variante "Planning" acima ("thinking out loud").
- No experimento com SWE-bench Verified, induzir planejamento explícito aumentou o pass rate em 4%.

### Sample Prompt: SWE-bench Verified

Prompt agêntico completo usado pela OpenAI para atingir o melhor score deles no SWE-bench Verified — padrão geral reaproveitável para qualquer tarefa agêntica. Reproduzido na íntegra (system prompt, tool description da `apply_patch`, definição da tool, e chamada via `client.responses.create`):

```python
from openai import OpenAI
import os

client = OpenAI(
    api_key=os.environ.get(
        "OPENAI_API_KEY", "<your OpenAI API key if not set as env var>"
    )
)

SYS_PROMPT_SWEBENCH = """
You will be tasked to fix an issue from an open-source repository.

Your thinking should be thorough and so it's fine if it's very long. You can think step by step before and after each action you decide to take.

You MUST iterate and keep going until the problem is solved.

You already have everything you need to solve this problem in the /testbed folder, even without internet connection. I want you to fully solve this autonomously before coming back to me.

Only terminate your turn when you are sure that the problem is solved. Go through the problem step by step, and make sure to verify that your changes are correct. NEVER end your turn without having solved the problem, and when you say you are going to make a tool call, make sure you ACTUALLY make the tool call, instead of ending your turn.

THE PROBLEM CAN DEFINITELY BE SOLVED WITHOUT THE INTERNET.

Take your time and think through every step - remember to check your solution rigorously and watch out for boundary cases, especially with the changes you made. Your solution must be perfect. If not, continue working on it. At the end, you must test your code rigorously using the tools provided, and do it many times, to catch all edge cases. If it is not robust, iterate more and make it perfect. Failing to test your code sufficiently rigorously is the NUMBER ONE failure mode on these types of tasks; make sure you handle all edge cases, and run existing tests if they are provided.

You MUST plan extensively before each function call, and reflect extensively on the outcomes of the previous function calls. DO NOT do this entire process by making function calls only, as this can impair your ability to solve the problem and think insightfully.

# Workflow

## High-Level Problem Solving Strategy

1. Understand the problem deeply. Carefully read the issue and think critically about what is required.
2. Investigate the codebase. Explore relevant files, search for key functions, and gather context.
3. Develop a clear, step-by-step plan. Break down the fix into manageable, incremental steps.
4. Implement the fix incrementally. Make small, testable code changes.
5. Debug as needed. Use debugging techniques to isolate and resolve issues.
6. Test frequently. Run tests after each change to verify correctness.
7. Iterate until the root cause is fixed and all tests pass.
8. Reflect and validate comprehensively. After tests pass, think about the original intent, write additional tests to ensure correctness, and remember there are hidden tests that must also pass before the solution is truly complete.

Refer to the detailed sections below for more information on each step.

## 1. Deeply Understand the Problem
Carefully read the issue and think hard about a plan to solve it before coding.

## 2. Codebase Investigation
- Explore relevant files and directories.
- Search for key functions, classes, or variables related to the issue.
- Read and understand relevant code snippets.
- Identify the root cause of the problem.
- Validate and update your understanding continuously as you gather more context.

## 3. Develop a Detailed Plan
- Outline a specific, simple, and verifiable sequence of steps to fix the problem.
- Break down the fix into small, incremental changes.

## 4. Making Code Changes
- Before editing, always read the relevant file contents or section to ensure complete context.
- If a patch is not applied correctly, attempt to reapply it.
- Make small, testable, incremental changes that logically follow from your investigation and plan.

## 5. Debugging
- Make code changes only if you have high confidence they can solve the problem
- When debugging, try to determine the root cause rather than addressing symptoms
- Debug for as long as needed to identify the root cause and identify a fix
- Use print statements, logs, or temporary code to inspect program state, including descriptive statements or error messages to understand what's happening
- To test hypotheses, you can also add test statements or functions
- Revisit your assumptions if unexpected behavior occurs.

## 6. Testing
- Run tests frequently using `!python3 run_tests.py` (or equivalent).
- After each change, verify correctness by running relevant tests.
- If tests fail, analyze failures and revise your patch.
- Write additional tests if needed to capture important behaviors or edge cases.
- Ensure all tests pass before finalizing.

## 7. Final Verification
- Confirm the root cause is fixed.
- Review your solution for logic correctness and robustness.
- Iterate until you are extremely confident the fix is complete and all tests pass.

## 8. Final Reflection and Additional Testing
- Reflect carefully on the original intent of the user and the problem statement.
- Think about potential edge cases or scenarios that may not be covered by existing tests.
- Write additional tests that would need to pass to fully validate the correctness of your solution.
- Run these new tests and ensure they all pass.
- Be aware that there are additional hidden tests that must also pass for the solution to be successful.
- Do not assume the task is complete just because the visible tests pass; continue refining until you are confident the fix is robust and comprehensive.
"""

PYTHON_TOOL_DESCRIPTION = """This function is used to execute Python code or terminal commands in a stateful Jupyter notebook environment. python will respond with the output of the execution or time out after 60.0 seconds. Internet access for this session is disabled. Do not make external web requests or API calls as they will fail. Just as in a Jupyter notebook, you may also execute terminal commands by calling this function with a terminal command, prefaced with an exclamation mark.

In addition, for the purposes of this task, you can call this function with an `apply_patch` command as input.  `apply_patch` effectively allows you to execute a diff/patch against a file, but the format of the diff specification is unique to this task, so pay careful attention to these instructions. To use the `apply_patch` command, you should pass a message of the following structure as "input":

%%bash
apply_patch <<"EOF"
*** Begin Patch
[YOUR_PATCH]
*** End Patch
EOF

Where [YOUR_PATCH] is the actual content of your patch, specified in the following V4A diff format.

*** [ACTION] File: [path/to/file] -> ACTION can be one of Add, Update, or Delete.
For each snippet of code that needs to be changed, repeat the following:
[context_before] -> See below for further instructions on context.
- [old_code] -> Precede the old code with a minus sign.
+ [new_code] -> Precede the new, replacement code with a plus sign.
[context_after] -> See below for further instructions on context.

For instructions on [context_before] and [context_after]:
- By default, show 3 lines of code immediately above and 3 lines immediately below each change. If a change is within 3 lines of a previous change, do NOT duplicate the first change's [context_after] lines in the second change's [context_before] lines.
- If 3 lines of context is insufficient to uniquely identify the snippet of code within the file, use the @@ operator to indicate the class or function to which the snippet belongs. For instance, we might have:
@@ class BaseClass
[3 lines of pre-context]
- [old_code]
+ [new_code]
[3 lines of post-context]

- If a code block is repeated so many times in a class or function such that even a single @@ statement and 3 lines of context cannot uniquely identify the snippet of code, you can use multiple `@@` statements to jump to the right context. For instance:

@@ class BaseClass
@@ 	def method():
[3 lines of pre-context]
- [old_code]
+ [new_code]
[3 lines of post-context]

Note, then, that we do not use line numbers in this diff format, as the context is enough to uniquely identify code. An example of a message that you might pass as "input" to this function, in order to apply a patch, is shown below.

%%bash
apply_patch <<"EOF"
*** Begin Patch
*** Update File: pygorithm/searching/binary_search.py
@@ class BaseClass
@@     def search():
-        pass
+        raise NotImplementedError()

@@ class Subclass
@@     def search():
-        pass
+        raise NotImplementedError()

*** End Patch
EOF

File references can only be relative, NEVER ABSOLUTE. After the apply_patch command is run, python will always say "Done!", regardless of whether the patch was successfully applied or not. However, you can determine if there are issue and errors by looking at any warnings or logging lines printed BEFORE the "Done!" is output.
"""

python_bash_patch_tool = {
  "type": "function",
  "name": "python",
  "description": PYTHON_TOOL_DESCRIPTION,
  "parameters": {
      "type": "object",
      "strict": True,
      "properties": {
          "input": {
              "type": "string",
              "description": " The Python code, terminal command (prefaced by exclamation mark), or apply_patch command that you wish to execute.",
          }
      },
      "required": ["input"],
  },
}

# Additional harness setup:
# - Add your repo to /testbed
# - Add your issue to the first user message
# - Note: Even though we used a single tool for python, bash, and apply_patch, we generally recommend defining more granular tools that are focused on a single function

response = client.responses.create(
    instructions=SYS_PROMPT_SWEBENCH,
    model="gpt-4.1-2025-04-14",
    tools=[python_bash_patch_tool],
    input=f"Please answer the following question:\nBug: Typerror..."
)

response.to_dict()["output"]
```

Nota do próprio guia: mesmo usando uma única tool para python/bash/apply_patch nesse exemplo, a recomendação geral da OpenAI é definir ferramentas mais granulares, focadas numa única função.

## 2. Long context

GPT-4.1 tem janela de contexto de 1M tokens, útil para: structured document parsing, re-ranking, selecionar informação relevante ignorando contexto irrelevante, e multi-hop reasoning usando contexto.

### Optimal Context Size

- Boa performance em needle-in-a-haystack até o 1M de contexto completo, e performance forte em tarefas complexas com mix de código/documentos relevantes e irrelevantes.
- Porém: "long context performance can degrade as more items are required to be retrieved, or perform complex reasoning that requires knowledge of the state of the entire context (like performing a graph search, for example)."

### Tuning Context Reliance

Ajustar o quanto o modelo deve confiar em conhecimento interno (do próprio treinamento) vs. só no contexto fornecido. Dois templates de instrução dados como exemplo:

```
# Instructions
// for internal knowledge
- Only use the documents in the provided External Context to answer the User Query. If you don't know the answer based on this context, you must respond "I don't have the information needed to answer that", even if a user insists on you answering the question.
// For internal and external knowledge
- By default, use the provided external context to answer the User Query, but if other basic knowledge is needed to answer, and you're confident in the answer, you can use some of your own knowledge to help answer the question.
```

### Prompt Organization

- Em contexto longo, o posicionamento de instruções e contexto afeta performance.
- Recomendação: colocar instruções tanto **antes quanto depois** do contexto fornecido — a OpenAI observou que isso funciona melhor do que só acima ou só abaixo.
- Se preferir colocar as instruções só uma vez, colocá-las **acima** do contexto funciona melhor do que abaixo.

## 3. Chain of Thought

- Reforça que GPT-4.1 não é reasoning model, mas pedir para "pensar passo a passo" (chain of thought) ajuda a decompor problemas, resolvê-los e melhorar a qualidade geral da saída — com o trade-off de custo/latência mais altos por usar mais tokens de output.
- "The model has been trained to perform well at agentic reasoning about and real-world problem solving, so it shouldn't require much prompting to perform well."

Instrução básica de CoT recomendada como ponto de partida, ao final do prompt:
```
...

First, think carefully step by step about what documents are needed to answer the query. Then, print out the TITLE and ID of each document. Then, format the IDs into a list.
```

- A partir daí: melhorar o prompt de CoT auditando falhas nos próprios exemplos/evals, e endereçar erros sistemáticos de planejamento/raciocínio com instruções mais explícitas. Em um CoT não restrito pode haver variância nas estratégias tentadas — se uma estratégia funciona bem, ela pode ser codificada explicitamente no prompt.
- "Generally speaking, errors tend to occur from misunderstanding user intent, insufficient context gathering or analysis, or insufficient or incorrect step by step thinking."

Exemplo de prompt que instrui o modelo a analisar metodicamente a intenção do usuário e considerar contexto relevante antes de responder:

```
# Reasoning Strategy
1. Query Analysis: Break down and analyze the query until you're confident about what it might be asking. Consider the provided context to help clarify any ambiguous or confusing information.
2. Context Analysis: Carefully select and analyze a large set of potentially relevant documents. Optimize for recall - it's okay if some are irrelevant, but the correct documents must be in this list, otherwise your final answer will be wrong. Analysis steps for each:
	a. Analysis: An analysis of how it may or may not be relevant to answering the query.
	b. Relevance rating: [high, medium, low, none]
3. Synthesis: summarize which documents are most relevant and why, including all documents with a relevance rating of medium or higher.

# User Question
{user_question}

# External Context
{external_context}

First, think carefully step by step about what documents are needed to answer the query, closely adhering to the provided Reasoning Strategy. Then, print out the TITLE and ID of each document. Then, format the IDs into a list.
```

## 4. Instruction Following

- GPT-4.1 tem "outstanding instruction-following performance", permitindo moldar/controlar precisamente as saídas: raciocínio agêntico, tom/voz da resposta, informação de tool-calling, formatação de output, tópicos a evitar, etc.
- Como o modelo segue instruções mais literalmente, pode ser necessário especificar explicitamente o que fazer/não fazer — prompts otimizados para outros modelos podem não funcionar de imediato, porque regras implícitas não são mais inferidas com a mesma força.

### Recommended Workflow

Workflow recomendado para desenvolver/depurar instruções em prompts:

1. Começar com uma seção geral `# Response Rules` ou `# Instructions`, com orientação de alto nível e bullet points.
2. Para mudar um comportamento mais específico, adicionar uma seção com mais detalhes para essa categoria (ex.: `# Sample Phrases`).
3. Se há passos específicos que o modelo deve seguir no workflow, adicionar uma lista ordenada e instruir o modelo a seguir esses passos.
4. Se o comportamento ainda não estiver correto:
   1. Checar instruções/exemplos conflitantes, subespecificados ou errados. Em caso de conflito, "GPT-4.1 tends to follow the one closer to the end of the prompt."
   2. Adicionar exemplos que demonstrem o comportamento desejado; garantir que qualquer comportamento importante demonstrado nos exemplos também esteja citado nas regras.
   3. Geralmente não é necessário usar all-caps ou incentivos como subornos/gorjetas. Recomendação: começar sem essas técnicas, e só recorrer a elas se necessário — "if your existing prompts include these techniques, it could cause GPT-4.1 to pay attention to it too strictly."

Nota adicional da seção: usar uma IDE com IA embutida ajuda a iterar em prompts — checar consistência/conflitos, adicionar exemplos, fazer updates coesos (ex.: adicionar uma instrução e ao mesmo tempo atualizar os exemplos que a demonstram).

### Common Failure Modes

Não exclusivos do GPT-4.1, mas listados para consciência geral/depuração:

- Instruir o modelo a sempre seguir um comportamento específico pode ter efeitos adversos. Ex.: "you must call a tool before responding to the user" pode levar o modelo a alucinar inputs de tool ou chamar a tool com valores nulos quando não tem informação suficiente. Mitigação: adicionar "if you don't have enough information to call the tool, ask the user for the information you need."
- Ao fornecer sample phrases, o modelo pode repeti-las literalmente e soar repetitivo — instruir explicitamente a variá-las.
- Sem instruções específicas, alguns modelos tendem a adicionar prosa extra explicando decisões, ou mais formatação do que o desejado — mitigar com instruções e possivelmente exemplos.

### Example Prompt: Customer Service

Exemplo completo ("demonstrates best practices for a fictional customer service agent" — observar diversidade de regras, especificidade, uso de seções extras para mais detalhe, e um exemplo final que incorpora todas as regras anteriores):

```python
SYS_PROMPT_CUSTOMER_SERVICE = """You are a helpful customer service agent working for NewTelco, helping a user efficiently fulfill their request while adhering closely to provided guidelines.

# Instructions
- Always greet the user with "Hi, you've reached NewTelco, how can I help you?"
- Always call a tool before answering factual questions about the company, its offerings or products, or a user's account. Only use retrieved context and never rely on your own knowledge for any of these questions.
    - However, if you don't have enough information to properly call the tool, ask the user for the information you need.
- Escalate to a human if the user requests.
- Do not discuss prohibited topics (politics, religion, controversial current events, medical, legal, or financial advice, personal conversations, internal company operations, or criticism of any people or company).
- Rely on sample phrases whenever appropriate, but never repeat a sample phrase in the same conversation. Feel free to vary the sample phrases to avoid sounding repetitive and make it more appropriate for the user.
- Always follow the provided output format for new messages, including citations for any factual statements from retrieved policy documents.
- If you're going to call a tool, always message the user with an appropriate message before and after calling the tool.
- Maintain a professional and concise tone in all responses, and use emojis between sentences.
- If you've resolved the user's request, ask if there's anything else you can help with

# Precise Response Steps (for each response)
1. If necessary, call tools to fulfill the user's desired action. Always message the user before and after calling a tool to keep them in the loop.
2. In your response to the user
    a. Use active listening and echo back what you heard the user ask for.
    b. Respond appropriately given the above guidelines.

# Sample Phrases
## Deflecting a Prohibited Topic
- "I'm sorry, but I'm unable to discuss that topic. Is there something else I can help you with?"
- "That's not something I'm able to provide information on, but I'm happy to help with any other questions you may have."

## Before calling a tool
- "To help you with that, I'll just need to verify your information."
- "Let me check that for you—one moment, please."
- "I'll retrieve the latest details for you now."

## After calling a tool
- "Okay, here's what I found: [response]"
- "So here's what I found: [response]"

# Output Format
- Always include your final response to the user.
- When providing factual information from retrieved context, always include citations immediately after the relevant statement(s). Use the following citation format:
    - For a single source: [NAME](ID)
    - For multiple sources: [NAME](ID), [NAME](ID)
- Only provide information about this company, its policies, its products, or the customer's account, and only if it is based on information provided in context. Do not answer questions outside this scope.

# Example
## User
Can you tell me about your family plan options?

## Assistant Response 1
### Message
"Hi, you've reached NewTelco, how can I help you? 😊🎉\n\nYou'd like to know about our family plan options. 🤝 Let me check that for you—one moment, please. 🚀"

### Tool Calls
lookup_policy_document(topic="family plan options")

// After tool call, the assistant would follow up with:

## Assistant Response 2 (after tool call)
### Message
"Okay, here's what I found: 🎉 Our family plan allows up to 5 lines with shared data and a 10% discount for each additional line [Family Plan Policy](ID-010). 📱 Is there anything else I can help you with today? 😊"
"""

get_policy_doc = {
    "type": "function",
    "name": "lookup_policy_document",
    "description": "Tool to look up internal documents and policies by topic or keyword.",
    "parameters": {
        "strict": True,
        "type": "object",
        "properties": {
            "topic": {
                "type": "string",
                "description": "The topic or keyword to search for in company policies or documents.",
            },
        },
        "required": ["topic"],
        "additionalProperties": False,
    },
}

get_user_acct = {
    "type": "function",
    "name": "get_user_account_info",
    "description": "Tool to get user account information",
    "parameters": {
        "strict": True,
        "type": "object",
        "properties": {
            "phone_number": {
                "type": "string",
                "description": "Formatted as '(xxx) xxx-xxxx'",
            },
        },
        "required": ["phone_number"],
        "additionalProperties": False,
    },
}

response = client.responses.create(
    instructions=SYS_PROMPT_CUSTOMER_SERVICE,
    model="gpt-4.1-2025-04-14",
    tools=[get_policy_doc, get_user_acct],
    input="How much will it cost for international service? I'm traveling to France.",
    # input="Why was my last bill so high?"
)

response.to_dict()["output"]
```

## 5. General Advice

### Prompt Structure

Esqueleto recomendado pela OpenAI como ponto de partida para estruturar prompts (seção referenciada no fragmento original da URL pesquisada):

```
# Role and Objective

# Instructions

## Sub-categories for more detailed instructions

# Reasoning Steps

# Output Format

# Examples
## Example 1

# Context

# Final instructions and prompt to think step by step
```

"Add or remove sections to suit your needs, and experiment to determine what's optimal for your usage."

### Delimiters

Diretrizes gerais para escolher delimitadores (ver seção "Long context" acima para considerações específicas de contexto longo):

1. **Markdown** — ponto de partida recomendado. Usar títulos markdown para seções principais e subseções (inclusive hierarquia mais profunda, até H4+). Usar backticks inline ou blocos de backtick para código, e listas numeradas/com marcadores como necessário.
2. **XML** — também funciona bem; a OpenAI diz ter melhorado a aderência a informação em XML neste modelo. XML é conveniente para: delimitar precisamente uma seção com início/fim, adicionar metadata nas tags, e permitir nesting. Exemplo de uso de tags XML para aninhar exemplos numa seção de exemplos, com input/output:
   ```xml
   <examples>
   <example1 type="Abbreviate">
   <input>San Francisco</input>
   <output>- SF</output>
   </example1>
   </examples>
   ```
3. **JSON** — altamente estruturado e bem compreendido pelo modelo, particularmente em contextos de coding. Porém pode ser mais verboso e exigir escaping de caracteres, o que adiciona overhead.

Orientação específica para adicionar um grande número de documentos/arquivos ao contexto de input:

- **XML** performou bem nos testes de contexto longo da OpenAI. Exemplo: `<doc id='1' title='The Fox'>The quick brown fox jumps over the lazy dog</doc>`
- O formato proposto por Lee et al. ([arxiv.org/pdf/2406.13121](https://arxiv.org/pdf/2406.13121)) também performou bem nos testes de contexto longo. Exemplo: `ID: 1 | TITLE: The Fox | CONTENT: The quick brown fox jumps over the lazy dog`
- **JSON performou particularmente mal.** Exemplo: `[{'id': 1, 'title': 'The Fox', 'content': 'The quick brown fox jumped over the lazy dog'}]`

"The model is trained to robustly understand structure in a variety of formats. Generally, use your judgement and think about what will provide clear information and 'stand out' to the model." Exemplo dado: se os documentos recuperados já contêm muito XML, um delimitador baseado em XML tende a ser menos eficaz (porque não "se destaca" do conteúdo).

### Caveats

- Em alguns casos isolados, o modelo mostrou resistência a produzir outputs muito longos e repetitivos (ex.: analisar centenas de itens um a um). Se isso for necessário no seu caso de uso, instruir fortemente o modelo a produzir a informação completa, e considerar quebrar o problema ou usar uma abordagem mais concisa.
- Foram observadas instâncias raras de parallel tool calls incorretas. Recomendação: testar isso, e considerar setar o parâmetro [`parallel_tool_calls`](https://platform.openai.com/docs/api-reference/responses/create#responses-create-parallel_tool_calls) como `false` se houver problemas.

## Appendix: Generating and Applying File Diffs

Feedback de devs: geração de diffs precisa e bem-formada é capacidade crítica para tarefas de coding. A família GPT-4.1 tem capacidades de diff "substantially improved" em relação a modelos GPT anteriores. Embora o modelo tenha boa performance gerando diffs em qualquer formato dado instruções e exemplos claros, a OpenAI disponibiliza (open-source) um formato de diff recomendado, no qual o modelo foi extensivamente treinado — para tirar o "guesswork" de criar diffs do zero, especialmente para quem está começando.

### Apply Patch

Tool call recomendada (formato **V4A diff**) — descrição completa da tool e sua definição JSON:

```python
APPLY_PATCH_TOOL_DESC = """This is a custom utility that makes it more convenient to add, remove, move, or edit code files. `apply_patch` effectively allows you to execute a diff/patch against a file, but the format of the diff specification is unique to this task, so pay careful attention to these instructions. To use the `apply_patch` command, you should pass a message of the following structure as "input":

%%bash
apply_patch <<"EOF"
*** Begin Patch
[YOUR_PATCH]
*** End Patch
EOF

Where [YOUR_PATCH] is the actual content of your patch, specified in the following V4A diff format.

*** [ACTION] File: [path/to/file] -> ACTION can be one of Add, Update, or Delete.
For each snippet of code that needs to be changed, repeat the following:
[context_before] -> See below for further instructions on context.
- [old_code] -> Precede the old code with a minus sign.
+ [new_code] -> Precede the new, replacement code with a plus sign.
[context_after] -> See below for further instructions on context.

For instructions on [context_before] and [context_after]:
- By default, show 3 lines of code immediately above and 3 lines immediately below each change. If a change is within 3 lines of a previous change, do NOT duplicate the first change's [context_after] lines in the second change's [context_before] lines.
- If 3 lines of context is insufficient to uniquely identify the snippet of code within the file, use the @@ operator to indicate the class or function to which the snippet belongs. For instance, we might have:
@@ class BaseClass
[3 lines of pre-context]
- [old_code]
+ [new_code]
[3 lines of post-context]

- If a code block is repeated so many times in a class or function such that even a single @@ statement and 3 lines of context cannot uniquely identify the snippet of code, you can use multiple `@@` statements to jump to the right context. For instance:

@@ class BaseClass
@@ 	def method():
[3 lines of pre-context]
- [old_code]
+ [new_code]
[3 lines of post-context]

Note, then, that we do not use line numbers in this diff format, as the context is enough to uniquely identify code. An example of a message that you might pass as "input" to this function, in order to apply a patch, is shown below.

%%bash
apply_patch <<"EOF"
*** Begin Patch
*** Update File: pygorithm/searching/binary_search.py
@@ class BaseClass
@@     def search():
-          pass
+          raise NotImplementedError()

@@ class Subclass
@@     def search():
-          pass
+          raise NotImplementedError()

*** End Patch
EOF
"""

APPLY_PATCH_TOOL = {
    "name": "apply_patch",
    "description": APPLY_PATCH_TOOL_DESC,
    "parameters": {
        "type": "object",
        "properties": {
            "input": {
                "type": "string",
                "description": " The apply_patch command that you wish to execute.",
            }
        },
        "required": ["input"],
    },
}
```

### Reference Implementation: apply_patch.py

Implementação de referência da tool `apply_patch` usada pela OpenAI como parte do treinamento do modelo (precisa ser tornada executável e disponível como `apply_patch` no shell onde o modelo executa comandos):

```python
#!/usr/bin/env python3

"""
A self-contained **pure-Python 3.9+** utility for applying human-readable
"pseudo-diff" patch files to a collection of text files.
"""

from __future__ import annotations

import pathlib
from dataclasses import dataclass, field
from enum import Enum
from typing import (
    Callable,
    Dict,
    List,
    Optional,
    Tuple,
    Union,
)


# --------------------------------------------------------------------------- #
#  Domain objects
# --------------------------------------------------------------------------- #
class ActionType(str, Enum):
    ADD = "add"
    DELETE = "delete"
    UPDATE = "update"


@dataclass
class FileChange:
    type: ActionType
    old_content: Optional[str] = None
    new_content: Optional[str] = None
    move_path: Optional[str] = None


@dataclass
class Commit:
    changes: Dict[str, FileChange] = field(default_factory=dict)


# --------------------------------------------------------------------------- #
#  Exceptions
# --------------------------------------------------------------------------- #
class DiffError(ValueError):
    """Any problem detected while parsing or applying a patch."""


# --------------------------------------------------------------------------- #
#  Helper dataclasses used while parsing patches
# --------------------------------------------------------------------------- #
@dataclass
class Chunk:
    orig_index: int = -1
    del_lines: List[str] = field(default_factory=list)
    ins_lines: List[str] = field(default_factory=list)


@dataclass
class PatchAction:
    type: ActionType
    new_file: Optional[str] = None
    chunks: List[Chunk] = field(default_factory=list)
    move_path: Optional[str] = None


@dataclass
class Patch:
    actions: Dict[str, PatchAction] = field(default_factory=dict)


# --------------------------------------------------------------------------- #
#  Patch text parser
# --------------------------------------------------------------------------- #
@dataclass
class Parser:
    current_files: Dict[str, str]
    lines: List[str]
    index: int = 0
    patch: Patch = field(default_factory=Patch)
    fuzz: int = 0

    # ------------- low-level helpers -------------------------------------- #
    def _cur_line(self) -> str:
        if self.index >= len(self.lines):
            raise DiffError("Unexpected end of input while parsing patch")
        return self.lines[self.index]

    @staticmethod
    def _norm(line: str) -> str:
        """Strip CR so comparisons work for both LF and CRLF input."""
        return line.rstrip("\r")

    # ------------- scanning convenience ----------------------------------- #
    def is_done(self, prefixes: Optional[Tuple[str, ...]] = None) -> bool:
        if self.index >= len(self.lines):
            return True
        if (
            prefixes
            and len(prefixes) > 0
            and self._norm(self._cur_line()).startswith(prefixes)
        ):
            return True
        return False

    def startswith(self, prefix: Union[str, Tuple[str, ...]]) -> bool:
        return self._norm(self._cur_line()).startswith(prefix)

    def read_str(self, prefix: str) -> str:
        """
        Consume the current line if it starts with *prefix* and return the text
        **after** the prefix.  Raises if prefix is empty.
        """
        if prefix == "":
            raise ValueError("read_str() requires a non-empty prefix")
        if self._norm(self._cur_line()).startswith(prefix):
            text = self._cur_line()[len(prefix) :]
            self.index += 1
            return text
        return ""

    def read_line(self) -> str:
        """Return the current raw line and advance."""
        line = self._cur_line()
        self.index += 1
        return line

    # ------------- public entry point -------------------------------------- #
    def parse(self) -> None:
        while not self.is_done(("*** End Patch",)):
            # ---------- UPDATE ---------- #
            path = self.read_str("*** Update File: ")
            if path:
                if path in self.patch.actions:
                    raise DiffError(f"Duplicate update for file: {path}")
                move_to = self.read_str("*** Move to: ")
                if path not in self.current_files:
                    raise DiffError(f"Update File Error - missing file: {path}")
                text = self.current_files[path]
                action = self._parse_update_file(text)
                action.move_path = move_to or None
                self.patch.actions[path] = action
                continue

            # ---------- DELETE ---------- #
            path = self.read_str("*** Delete File: ")
            if path:
                if path in self.patch.actions:
                    raise DiffError(f"Duplicate delete for file: {path}")
                if path not in self.current_files:
                    raise DiffError(f"Delete File Error - missing file: {path}")
                self.patch.actions[path] = PatchAction(type=ActionType.DELETE)
                continue

            # ---------- ADD ---------- #
            path = self.read_str("*** Add File: ")
            if path:
                if path in self.patch.actions:
                    raise DiffError(f"Duplicate add for file: {path}")
                if path in self.current_files:
                    raise DiffError(f"Add File Error - file already exists: {path}")
                self.patch.actions[path] = self._parse_add_file()
                continue

            raise DiffError(f"Unknown line while parsing: {self._cur_line()}")

        if not self.startswith("*** End Patch"):
            raise DiffError("Missing *** End Patch sentinel")
        self.index += 1  # consume sentinel

    # ------------- section parsers ---------------------------------------- #
    def _parse_update_file(self, text: str) -> PatchAction:
        action = PatchAction(type=ActionType.UPDATE)
        lines = text.split("\n")
        index = 0
        while not self.is_done(
            (
                "*** End Patch",
                "*** Update File:",
                "*** Delete File:",
                "*** Add File:",
                "*** End of File",
            )
        ):
            def_str = self.read_str("@@ ")
            section_str = ""
            if not def_str and self._norm(self._cur_line()) == "@@":
                section_str = self.read_line()

            if not (def_str or section_str or index == 0):
                raise DiffError(f"Invalid line in update section:\n{self._cur_line()}")

            if def_str.strip():
                found = False
                if def_str not in lines[:index]:
                    for i, s in enumerate(lines[index:], index):
                        if s == def_str:
                            index = i + 1
                            found = True
                            break
                if not found and def_str.strip() not in [
                    s.strip() for s in lines[:index]
                ]:
                    for i, s in enumerate(lines[index:], index):
                        if s.strip() == def_str.strip():
                            index = i + 1
                            self.fuzz += 1
                            found = True
                            break

            next_ctx, chunks, end_idx, eof = peek_next_section(self.lines, self.index)
            new_index, fuzz = find_context(lines, next_ctx, index, eof)
            if new_index == -1:
                ctx_txt = "\n".join(next_ctx)
                raise DiffError(
                    f"Invalid {'EOF ' if eof else ''}context at {index}:\n{ctx_txt}"
                )
            self.fuzz += fuzz
            for ch in chunks:
                ch.orig_index += new_index
                action.chunks.append(ch)
            index = new_index + len(next_ctx)
            self.index = end_idx
        return action

    def _parse_add_file(self) -> PatchAction:
        lines: List[str] = []
        while not self.is_done(
            ("*** End Patch", "*** Update File:", "*** Delete File:", "*** Add File:")
        ):
            s = self.read_line()
            if not s.startswith("+"):
                raise DiffError(f"Invalid Add File line (missing '+'): {s}")
            lines.append(s[1:])  # strip leading '+'
        return PatchAction(type=ActionType.ADD, new_file="\n".join(lines))


# --------------------------------------------------------------------------- #
#  Helper functions
# --------------------------------------------------------------------------- #
def find_context_core(
    lines: List[str], context: List[str], start: int
) -> Tuple[int, int]:
    if not context:
        return start, 0

    for i in range(start, len(lines)):
        if lines[i : i + len(context)] == context:
            return i, 0
    for i in range(start, len(lines)):
        if [s.rstrip() for s in lines[i : i + len(context)]] == [
            s.rstrip() for s in context
        ]:
            return i, 1
    for i in range(start, len(lines)):
        if [s.strip() for s in lines[i : i + len(context)]] == [
            s.strip() for s in context
        ]:
            return i, 100
    return -1, 0


def find_context(
    lines: List[str], context: List[str], start: int, eof: bool
) -> Tuple[int, int]:
    if eof:
        new_index, fuzz = find_context_core(lines, context, len(lines) - len(context))
        if new_index != -1:
            return new_index, fuzz
        new_index, fuzz = find_context_core(lines, context, start)
        return new_index, fuzz + 10_000
    return find_context_core(lines, context, start)


def peek_next_section(
    lines: List[str], index: int
) -> Tuple[List[str], List[Chunk], int, bool]:
    old: List[str] = []
    del_lines: List[str] = []
    ins_lines: List[str] = []
    chunks: List[Chunk] = []
    mode = "keep"
    orig_index = index

    while index < len(lines):
        s = lines[index]
        if s.startswith(
            (
                "@@",
                "*** End Patch",
                "*** Update File:",
                "*** Delete File:",
                "*** Add File:",
                "*** End of File",
            )
        ):
            break
        if s == "***":
            break
        if s.startswith("***"):
            raise DiffError(f"Invalid Line: {s}")
        index += 1

        last_mode = mode
        if s == "":
            s = " "
        if s[0] == "+":
            mode = "add"
        elif s[0] == "-":
            mode = "delete"
        elif s[0] == " ":
            mode = "keep"
        else:
            raise DiffError(f"Invalid Line: {s}")
        s = s[1:]

        if mode == "keep" and last_mode != mode:
            if ins_lines or del_lines:
                chunks.append(
                    Chunk(
                        orig_index=len(old) - len(del_lines),
                        del_lines=del_lines,
                        ins_lines=ins_lines,
                    )
                )
            del_lines, ins_lines = [], []

        if mode == "delete":
            del_lines.append(s)
            old.append(s)
        elif mode == "add":
            ins_lines.append(s)
        elif mode == "keep":
            old.append(s)

    if ins_lines or del_lines:
        chunks.append(
            Chunk(
                orig_index=len(old) - len(del_lines),
                del_lines=del_lines,
                ins_lines=ins_lines,
            )
        )

    if index < len(lines) and lines[index] == "*** End of File":
        index += 1
        return old, chunks, index, True

    if index == orig_index:
        raise DiffError("Nothing in this section")
    return old, chunks, index, False


# --------------------------------------------------------------------------- #
#  Patch → Commit and Commit application
# --------------------------------------------------------------------------- #
def _get_updated_file(text: str, action: PatchAction, path: str) -> str:
    if action.type is not ActionType.UPDATE:
        raise DiffError("_get_updated_file called with non-update action")
    orig_lines = text.split("\n")
    dest_lines: List[str] = []
    orig_index = 0

    for chunk in action.chunks:
        if chunk.orig_index > len(orig_lines):
            raise DiffError(
                f"{path}: chunk.orig_index {chunk.orig_index} exceeds file length"
            )
        if orig_index > chunk.orig_index:
            raise DiffError(
                f"{path}: overlapping chunks at {orig_index} > {chunk.orig_index}"
            )

        dest_lines.extend(orig_lines[orig_index : chunk.orig_index])
        orig_index = chunk.orig_index

        dest_lines.extend(chunk.ins_lines)
        orig_index += len(chunk.del_lines)

    dest_lines.extend(orig_lines[orig_index:])
    return "\n".join(dest_lines)


def patch_to_commit(patch: Patch, orig: Dict[str, str]) -> Commit:
    commit = Commit()
    for path, action in patch.actions.items():
        if action.type is ActionType.DELETE:
            commit.changes[path] = FileChange(
                type=ActionType.DELETE, old_content=orig[path]
            )
        elif action.type is ActionType.ADD:
            if action.new_file is None:
                raise DiffError("ADD action without file content")
            commit.changes[path] = FileChange(
                type=ActionType.ADD, new_content=action.new_file
            )
        elif action.type is ActionType.UPDATE:
            new_content = _get_updated_file(orig[path], action, path)
            commit.changes[path] = FileChange(
                type=ActionType.UPDATE,
                old_content=orig[path],
                new_content=new_content,
                move_path=action.move_path,
            )
    return commit


# --------------------------------------------------------------------------- #
#  User-facing helpers
# --------------------------------------------------------------------------- #
def text_to_patch(text: str, orig: Dict[str, str]) -> Tuple[Patch, int]:
    lines = text.splitlines()  # preserves blank lines, no strip()
    if (
        len(lines) < 2
        or not Parser._norm(lines[0]).startswith("*** Begin Patch")
        or Parser._norm(lines[-1]) != "*** End Patch"
    ):
        raise DiffError("Invalid patch text - missing sentinels")

    parser = Parser(current_files=orig, lines=lines, index=1)
    parser.parse()
    return parser.patch, parser.fuzz


def identify_files_needed(text: str) -> List[str]:
    lines = text.splitlines()
    return [
        line[len("*** Update File: ") :]
        for line in lines
        if line.startswith("*** Update File: ")
    ] + [
        line[len("*** Delete File: ") :]
        for line in lines
        if line.startswith("*** Delete File: ")
    ]


def identify_files_added(text: str) -> List[str]:
    lines = text.splitlines()
    return [
        line[len("*** Add File: ") :]
        for line in lines
        if line.startswith("*** Add File: ")
    ]


# --------------------------------------------------------------------------- #
#  File-system helpers
# --------------------------------------------------------------------------- #
def load_files(paths: List[str], open_fn: Callable[[str], str]) -> Dict[str, str]:
    return {path: open_fn(path) for path in paths}


def apply_commit(
    commit: Commit,
    write_fn: Callable[[str, str], None],
    remove_fn: Callable[[str], None],
) -> None:
    for path, change in commit.changes.items():
        if change.type is ActionType.DELETE:
            remove_fn(path)
        elif change.type is ActionType.ADD:
            if change.new_content is None:
                raise DiffError(f"ADD change for {path} has no content")
            write_fn(path, change.new_content)
        elif change.type is ActionType.UPDATE:
            if change.new_content is None:
                raise DiffError(f"UPDATE change for {path} has no new content")
            target = change.move_path or path
            write_fn(target, change.new_content)
            if change.move_path:
                remove_fn(path)


def process_patch(
    text: str,
    open_fn: Callable[[str], str],
    write_fn: Callable[[str, str], None],
    remove_fn: Callable[[str], None],
) -> str:
    if not text.startswith("*** Begin Patch"):
        raise DiffError("Patch text must start with *** Begin Patch")
    paths = identify_files_needed(text)
    orig = load_files(paths, open_fn)
    patch, _fuzz = text_to_patch(text, orig)
    commit = patch_to_commit(patch, orig)
    apply_commit(commit, write_fn, remove_fn)
    return "Done!"


# --------------------------------------------------------------------------- #
#  Default FS helpers
# --------------------------------------------------------------------------- #
def open_file(path: str) -> str:
    with open(path, "rt", encoding="utf-8") as fh:
        return fh.read()


def write_file(path: str, content: str) -> None:
    target = pathlib.Path(path)
    target.parent.mkdir(parents=True, exist_ok=True)
    with target.open("wt", encoding="utf-8") as fh:
        fh.write(content)


def remove_file(path: str) -> None:
    pathlib.Path(path).unlink(missing_ok=True)


# --------------------------------------------------------------------------- #
#  CLI entry-point
# --------------------------------------------------------------------------- #
def main() -> None:
    import sys

    patch_text = sys.stdin.read()
    if not patch_text:
        print("Please pass patch text through stdin", file=sys.stderr)
        return
    try:
        result = process_patch(patch_text, open_file, write_file, remove_file)
    except DiffError as exc:
        print(exc, file=sys.stderr)
        return
    print(result)


if __name__ == "__main__":
    main()
```

### Other Effective Diff Formats

Se quiser usar um formato de diff diferente, a OpenAI relata que o formato **SEARCH/REPLACE** (usado no polyglot benchmark do Aider) e um formato **pseudo-XML** sem escaping interno tiveram alta taxa de sucesso nos testes deles.

"These diff formats share two key aspects: (1) they do not use line numbers, and (2) they provide both the exact code to be replaced, and the exact code with which to replace it, with clear delimiters between the two."

````python
SEARCH_REPLACE_DIFF_EXAMPLE = """
path/to/file.py
```
>>>>>>> SEARCH
def search():
    pass
=======
def search():
   raise NotImplementedError()
<<<<<<< REPLACE
"""

PSEUDO_XML_DIFF_EXAMPLE = """
<edit>
<file>
path/to/file.py
</file>
<old_code>
def search():
    pass
</old_code>
<new_code>
def search():
   raise NotImplementedError()
</new_code>
</edit>
"""
````

---

**Source:** https://developers.openai.com/cookbook/examples/gpt4-1_prompting_guide — acessado em 2026-08-07.
