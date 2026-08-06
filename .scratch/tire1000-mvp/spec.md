# Tire 1000 — MVP

Status: ready-for-agent

## Problem Statement

Estudantes se preparando para o ENEM precisam praticar a escrita de redação modelo ENEM regularmente, mas não têm um jeito acessível e rápido de receber uma devolutiva detalhada por competência sobre o que escreveram — o feedback humano (professor, cursinho) é caro, lento ou indisponível com a frequência necessária pra treino.

## Solution

Tire 1000 é uma plataforma web responsiva (mobile-first) onde o estudante fotografa uma redação escrita à mão sobre um tema modelo ENEM disponível na plataforma, envia essa foto para **Correção**, e recebe de volta uma **Revisão** (checagem de formato/legibilidade) seguida de uma **Avaliação** detalhada nas 5 competências do ENEM, com nota e parecer por competência, nota final, parecer geral, e trechos da redação destacados (highlights) que embasam a avaliação. Cada Correção consome 1 crédito, comprado via checkout do Stripe.

## User Stories

**Cadastro e autenticação**

1. Como visitante, quero criar uma conta com nome, email e senha, para começar a usar a plataforma.
2. Como usuário cadastrado, quero fazer login com email e senha, para acessar minha conta.

**Créditos e pagamento**

3. Como usuário autenticado, quero comprar créditos a qualquer momento, para poder enviar redações para Correção.
4. Como usuário recém-cadastrado, quero que a compra de créditos não seja obrigatória no cadastro, para poder explorar a plataforma antes de decidir pagar.
5. Como usuário, quero ser redirecionado para a página de checkout do Stripe ao comprar créditos, para pagar com segurança sem que a plataforma manuseie dados de cartão.
6. Como usuário, quero ser redirecionado de volta à plataforma após concluir (ou cancelar) o pagamento, para continuar de onde parei.
7. Como usuário, quero ver meu saldo de créditos, para saber quantas Correções ainda posso enviar.
8. Como operador da plataforma, quero que toda compra de crédito seja registrada (quantidade, valor pago em centavos, usuário, data, status, id, externalId, gateway), para ter histórico financeiro completo.
9. Como sistema, quero validar a assinatura do evento de webhook do Stripe antes de creditar o usuário, para garantir que apenas eventos legítimos concedam créditos.

**Temas**

10. Como usuário autenticado, quero listar temas de redação ordenados pela data de publicação, para ver os mais recentes primeiro.
11. Como usuário autenticado, quero filtrar temas por eixo, para focar em um assunto específico.
12. Como usuário autenticado, quero buscar temas pelo título, para encontrar um tema específico rapidamente.
13. Como usuário autenticado, quero abrir um tema específico e ver seus textos motivadores (texto e imagem), para me preparar antes de escrever.
14. Como usuário autenticado, quero listar todos os eixos disponíveis, para navegar temas por categoria.

**Envio de redação (Revisão)**

15. Como usuário autenticado, quero enviar uma foto da minha redação vinculada a um tema, para receber uma Correção.
16. Como usuário autenticado, quero que 1 crédito seja debitado ao enviar minha redação para Revisão, para pagar pela Correção.
17. Como usuário autenticado, quero receber meu crédito de volta caso minha redação seja rejeitada (ou falhe por erro de sistema) na Revisão, para não perder o crédito por um problema alheio à minha escrita.
18. Como usuário autenticado, quero saber o motivo da rejeição (letra ilegível, iluminação baixa, menos de 7 linhas, mais de 30 linhas), para corrigir o problema e reenviar.
19. Como usuário autenticado, quero reenviar uma nova foto para uma redação rejeitada, para tentar novamente sem perder o vínculo com o tema original.
20. Como usuário autenticado, quero que a foto da minha redação seja removida do armazenamento assim que a análise terminar (com sucesso ou não), para proteger minha privacidade.
21. Como usuário autenticado, quero que fotos maiores que 10MB sejam rejeitadas no envio, para evitar uploads inválidos.

**Avaliação**

22. Como usuário autenticado, quero que minha redação revisada seja avaliada nas 5 competências do ENEM, para saber meus pontos fortes e fracos.
23. Como usuário autenticado, quero ver uma nota e um parecer para cada competência, para entender minha avaliação em detalhe.
24. Como usuário autenticado, quero ver uma nota final e um parecer geral, para ter uma visão consolidada do meu desempenho.
25. Como usuário autenticado, quero ver trechos destacados (highlights) do texto da minha redação vinculados a cada competência, para entender exatamente onde a avaliação se aplica.
26. Como usuário autenticado, quero que, se a Avaliação falhar por erro de sistema, meu crédito não seja devolvido automaticamente, já que a mesma redação será reprocessada pelo time depois do reparo do erro (ver ADR-0001).

**Histórico**

27. Como usuário autenticado, quero listar minhas redações enviadas, ordenadas pela ordem de envio, para acompanhar meu histórico.
28. Como usuário autenticado, quero ver na listagem o título e a cor do eixo do tema de cada redação, para identificar rapidamente do que se trata sem abrir cada uma.
29. Como usuário autenticado, quero abrir uma redação específica e ver tema, data de envio, texto da redação, highlights e as avaliações das 5 competências + avaliação geral, para revisar meu desempenho.

**Operação e custo**

30. Como operador da plataforma, quero que o custo em tokens e a estimativa de custo em R$ de cada etapa (Revisão/Avaliação) sejam registrados por redação, para acompanhar o custo operacional de IA.
31. Como operador da plataforma, quero ser notificado por email quando uma redação falhar 3 vezes seguidas na fila de Revisão ou de Avaliação, para investigar manualmente.
32. Como operador da plataforma, quero ser notificado por email quando um usuário acumular mais de 10 tentativas de redação rejeitada, para avaliar se há um problema recorrente.

## Implementation Decisions

### Arquitetura e seam de teste

- Cada operação de negócio é um **caso de uso** (função ou classe) que recebe suas dependências por injeção: repositórios (acesso ao DynamoDB) e gateways (Cognito, Stripe, Gemini, S3, SQS, SNS). Handlers Lambda ficam finos — parseiam o evento, chamam o caso de uso, formatam a resposta — e não carregam lógica de negócio.
- Casos de uso do MVP: `SignUpUser`, `RequestCreditsCheckout`, `ConfirmCreditsCheckout`, `UploadEssay`, `ResendEssay`, `EnqueueEssayValidation`, `ValidateEssay`, `EvaluateEssay`, `ListThemes`, `GetTheme`, `ListTopics`, `ListUserEssays`, `GetEssayDetail`.
- Todo item da tabela DynamoDB carrega um atributo `type` (discriminador: `USER`, `THEME`, `TOPIC`, `REFERENCE_TEXT`, `ESSAY`, `ESSAY_EVALUATION`, `ESSAY_COST`, `CHECKOUT`), e `createdAt`/`updatedAt` em todas as entidades.
- Identificadores de entidade são KSUID.

### Modelo de dados — DynamoDB single-table (corrigido)

| Entidade | PK | SK | GSI1PK | GSI1SK | GSI2PK | GSI2SK |
|---|---|---|---|---|---|---|
| Theme | `THEMES` | `THEME#<enemYear\|createdAt>#<themeId>` | `TOPIC#<topicId>` | `THEME#<enemYear\|createdAt>#<themeId>` | `THEME#<themeId>` | `THEME#<themeId>` |
| ThemeTopic (Eixo) | `TOPICS` | `TOPIC#<topicId>` | `TOPIC#<topicId>` (igual ao dos seus Themes) | `#TOPIC#<topicId>` (ordena antes de `THEME#...`) | — | — |
| ReferenceText | `REFERENCE_TEXT#<themeId>` | `REFERENCE_TEXT#<referenceId>` | — | — | `THEME#<themeId>` | `REFERENCE_TEXT#<referenceId>` |
| User | `USER#<userId>` | `USER#<userId>` | `USER#<email>` | `USER#<email>` | — | — |
| Essay | `USER#<userId>` | `ESSAY#<essayId>` | `ESSAY#<essayId>` (compartilhado com sua Evaluation) | `ESSAY#<essayId>` | — | — |
| EssayEvaluation | `EVALUATION#<essayId>` | `EVALUATION#<essayId>` | `ESSAY#<essayId>` (compartilhado com a Essay) | `EVALUATION#<essayId>` (ordena depois de `ESSAY#...`) | — | — |
| EssayCost | `ESSAY_COST#<essayId>` | `ESSAY_COST#<id>` | `USER#<userId>` | `ESSAY_COST#<id>` | — | — |
| Checkout | `CHECKOUT#<externalId>` | `CHECKOUT#<externalId>` | — | — | — | — |

Notas sobre correções feitas em cima do modelo original (ver ADRs em `docs/adr/`):
- **Theme**: SK combina `enemYear` (formato `YYYY-01-01`) quando existir, ou `createdAt` (formato `YYYY-MM-DD`) quando não — `enemYear` é opcional (ADR-0003). Isso resolve a colisão de SK entre temas do mesmo ano.
- **ThemeTopic**: GSI1PK agora é idêntico ao dos Themes daquele eixo (necessário pra aparecerem na mesma query); o eixo aparece primeiro porque sua GSI1SK (`#TOPIC#<id>`) ordena antes de `THEME#...` em ASCII.
- **Essay**: denormaliza `themeTitle` e `topicColor` (não `topicId`) pra listagem sem fetch extra (ver Decisões original).
- **EssayEvaluation**: GSI1PK agora é `ESSAY#<essayId>` (igual ao da Essay), não `EVALUATION#<essayId>` — necessário pra "listar redação e sua avaliação pelo id" funcionar numa única query GSI1.
- **EssayCost**: SK trocada de `ESSAY_COST#<essayId>` (colidia — uma redação gera custo em pelo menos 2 etapas) para `ESSAY_COST#<id>` (KSUID próprio do registro de custo).

### Atributos por entidade

- **User**: `id`, `externalId` (sub do Cognito), `email`, `name`, `credits` (number)
- **Checkout**: `id`, `externalId` (id da Checkout Session do Stripe), `gateway` (`STRIPE`), `status` (`PENDING`\|`COMPLETED`\|`FAILED`), `amountInCents`, `creditsQty`, `userId`
- **Essay**: `id`, `status` (`UPLOADING`\|`QUEUED`\|`VALIDATING`\|`VALIDATION_FAILED`\|`REJECTED`\|`VALIDATED`\|`EVALUATING`\|`EVALUATION_FAILED`\|`SUCCESS`), `validationAttempts`, `rejectedAttempts`, `rejectionReasons` (string[]), `fileKey`, `textContent`, `evaluationAttempts`, `finalScore`, `userId`, `themeId`, `themeTitle`, `topicColor`
- **EssayEvaluation**: `essayId`, `scores` (`{C1..C5, final}: {score, evaluationText}`), `highlights` (`[{type, anchorIndex, endIndex, textContent}]`)
- **EssayCost**: `id`, `essayId`, `amountInCents`, `tokens`, `step` (`VALIDATION`\|`EVALUATION`)
- **Theme**: `id`, `title`, `enemYear` (opcional), `topicId`
- **ThemeTopic**: `id`, `title`, `color`
- **ReferenceText**: `id`, `title`, `font`, `paragraphs` (`[{type: TEXT|IMAGE, content: string | {fileKey, font}}]`), `themeId`

### Autenticação e cadastro

- `POST /auth/signup { name, email, password }` → cria conta no Cognito (auto-verificada), retorna tokens. Não cria Checkout — compra de créditos é sempre um passo separado e opcional.
- `POST /auth/login { email, password }` → autentica via Cognito, retorna tokens.
- Login social (Google) está fora de escopo do MVP.

### Créditos e checkout

- `POST /credits/checkout { creditsQty }` (autenticado) → cria uma Stripe Checkout Session usando um Price fixo por crédito cadastrado no Stripe, `quantity = creditsQty`; grava `Checkout` com `status: PENDING`; retorna `checkoutUrl`.
- Webhook do Stripe → `ConfirmCreditsCheckout`: valida a assinatura do evento, usa o total retornado pelo Stripe (nunca um valor vindo do cliente) para preencher `amountInCents`, credita o usuário (`credits += creditsQty`) e atualiza `Checkout.status = COMPLETED` (ver ADR-0002).

### Envio, Revisão e Avaliação de redação

- `POST /essays { themeId }` ou `POST /essays/{essayId}` (reenvio) → gera uma presigned POST URL pro bucket de redações, cria/atualiza a `Essay` com `status: UPLOADING`.
- Upload direto do cliente pro bucket (S3). Trigger de S3 → `EnqueueEssayValidation`: pega os metadados, atualiza `Essay.status = QUEUED`, envia pra fila de Revisão (SQS).
- `ValidateEssay` (consumidor da fila de Revisão): debita 1 crédito do usuário, atualiza `status: VALIDATING`, registra o custo estimado (`EssayCost`, `step: VALIDATION`), chama o Gemini com um único prompt que retorna **ou** o texto OCR'd da redação **ou** um array de motivos de rejeição (letra ilegível, iluminação baixa, <7 linhas, >30 linhas — a contagem de linhas também é lida da imagem pelo mesmo prompt).
  - Sucesso: `Essay.textContent` = texto retornado, `status: VALIDATED`, `fileKey: null` (foto removida do bucket).
  - Rejeição: `status: REJECTED`, `rejectedAttempts += 1`, `validationAttempts` reseta, `rejectionReasons` preenchido, `fileKey: null`, crédito devolvido.
  - Falha de sistema (após 3 tentativas): `status: VALIDATION_FAILED`, `fileKey: null`, crédito devolvido, mensagem vai pra DLQ de Revisão, alerta por email ao dev (CloudWatch + SNS).
  - Se `rejectedAttempts > 10`: alerta por email ao dev — sem outra ação automática.
- Ao validar com sucesso, a redação segue pra fila de Avaliação.
- `EvaluateEssay` (consumidor da fila de Avaliação): chama o Gemini com o texto + 5 prompts, um por competência (avaliadas independentemente), registra o custo estimado (`EssayCost`, `step: EVALUATION`).
  - Sucesso: grava `EssayEvaluation` (scores C1-C5 + final, highlights), `Essay.finalScore`, `status: SUCCESS`.
  - Falha de sistema (após 3 tentativas): `status: EVALUATION_FAILED`, **crédito não é devolvido** (ADR-0001), mensagem vai pra DLQ de Avaliação, alerta por email ao dev; a correção é reprocessar a mesma redação depois do reparo do erro (redrive da DLQ), não reembolsar.

### Leitura de temas e eixos

- `GET /themes?topicId=&search=` (autenticado) — lista temas, ordenados por data de publicação (ver seção do modelo de dados), filtráveis por eixo ou por busca no título.
- `GET /themes/{themeId}` (autenticado) — tema + seus textos motivadores.
- `GET /topics` (autenticado) — lista eixos.
- Cadastro de temas/eixos/textos motivadores é feito diretamente no banco pelo time — não há API de escrita pra essas entidades no MVP.

### Leitura de redações

- `GET /essays` (autenticado) — lista as redações do usuário logado, ordenadas pela ordem de envio.
- `GET /essays/{essayId}` (autenticado, só o dono) — tema, data de envio, texto, highlights, avaliações das 5 competências e avaliação geral.

## Testing Decisions

- Um bom teste aqui exerce o **caso de uso** através da sua interface pública (input → output + estado resultante nos fakes + chamadas feitas aos gateways), nunca detalhes internos de implementação. Não testar SDKs da AWS nem o Gemini diretamente — eles são substituídos por fakes/stubs em memória que implementam a mesma interface do gateway/repositório real.
- Módulos a testar: todos os casos de uso listados na seção de Arquitetura (`SignUpUser`, `RequestCreditsCheckout`, `ConfirmCreditsCheckout`, `UploadEssay`, `ResendEssay`, `EnqueueEssayValidation`, `ValidateEssay`, `EvaluateEssay`, `ListThemes`, `GetTheme`, `ListTopics`, `ListUserEssays`, `GetEssayDetail`), incluindo os ramos de erro (rejeição, falha de sistema, threshold de 10 rejeições, falha de assinatura do webhook).
- Não há teste anterior no repo (projeto greenfield) — o padrão caso-de-uso-com-DI estabelecido aqui é a referência pros módulos seguintes.
- Vitest só roda no backend.

## Out of Scope

- Login social (Google) — adiado pra uma versão futura.
- Navegação pública/não-autenticada — tudo exige login no MVP.
- API de escrita para temas, eixos e textos motivadores — cadastro é manual, direto no banco.
- Cupons, descontos ou lógica de preço além de "preço fixo por crédito no Stripe".
- Qualquer ação automática além do email ao dev quando um usuário passa de 10 tentativas rejeitadas (sem bloqueio automático, sem reembolso extra).
- App mobile nativo — só web responsiva mobile-first.
- Paginação e rate limiting — detalhes de implementação a decidir na fase de tickets, não especificados aqui.

## Further Notes

- Vocabulário do domínio (Correção, Revisão, Avaliação, Eixo) está em `CONTEXT.md` — usar esses termos em tickets, testes e código onde fizer sentido.
- Decisões arquiteturais registradas: `docs/adr/0001-falha-na-avaliacao-nao-devolve-credito.md`, `docs/adr/0002-preco-do-credito-definido-no-stripe.md`, `docs/adr/0003-theme-sk-enemyear-opcional.md`.
- Fontes primárias usadas pra montar este spec: ERD, diagrama de fluxo de cadastro, diagrama de fluxo de envio/reenvio de redação, `Access Patterns.html`, `Decisões.html`, `Table Design.html`, `Levantamento de requisitos.md`, e o design no Figma (mobile-first).
- Stack: TypeScript, Lambda/SQS/SNS/DynamoDB/S3, Serverless Framework (**nenhum comando do Serverless deve ser executado por um agente — só o dev roda**), React + Tailwind + Axios no front, Vitest no backend.
