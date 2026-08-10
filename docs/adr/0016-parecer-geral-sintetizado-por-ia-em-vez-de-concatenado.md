# Parecer geral da Avaliação passa a ser sintetizado por IA, não concatenado

Hoje o `evaluationText` do score `final` é gerado localmente por `buildFinalScore` (`gemini-essay-evaluation-gateway.ts`), que só concatena os 5 pareceres de competência com o título de cada uma na frente. Como os 5 pareceres já aparecem individualmente na tela de resultado, essa concatenação é puramente redundante.

Decidimos substituir por uma sexta chamada de IA (novo prompt em `domain/ai/`, seguindo a convenção `prompt.ts`+`schema.ts` das pastas existentes), rodando sequencialmente depois das 5 chamadas paralelas (`Promise.all`) já existentes, dentro do mesmo consumer da fila de Avaliação (timeout 90s). A pipeline já é assíncrona e tolerante a latência — o frontend faz polling em `GET /essays/{id}` — então essa chamada extra não pressiona nenhum request síncrono.

Essa chamada recebe só os 5 pares (competência + score + parecer) e o `themeTitle` da redação — **não** reenvia o `textContent` completo. Os 5 pareceres individuais já citam trechos relevantes quando útil, então a síntese tem material concreto sem precisar reprocessar a redação inteira; reenviar o texto completo encareceria e atrasaria a Avaliação sem ganho claro.

O número do score final continua sendo a soma local dos 5 (sem IA); só o parecer geral passa a vir do modelo. Falhas dessa chamada seguem o mesmo padrão "tudo ou nada" já usado nas outras chamadas do pipeline — sem retry próprio, redrive via SQS (`maxReceiveCount: 3` → DLQ), `evaluationAttempts` rastreado pelo use-case.

**Consideramos** embutir a síntese numa das 5 chamadas por competência existentes, mas rejeitamos: cada uma delas roda isolada (só vê sua própria competência), e dar a uma delas visão sobre as outras 4 quebraria esse isolamento e a paralelização via `Promise.all`.
