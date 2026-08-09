# Erros `fields` do backend mapeados pro `Field` correspondente; resto vira toast

O backend já tem uma convenção estabelecida (`Schema`/`FieldsError`, `backend/src/application/controllers/schema.ts`) usada por login, signup, checkout de créditos e upload de redação: erro de validação Zod vira `400` com corpo `{ fields: Record<string, string[]> }` (chave `_` pra erro sem campo específico, ex. regra cross-field); qualquer outro `DomainError` vira `{ message: string }`. O frontend nunca soube disso — cada modal tratava erro como um texto vermelho genérico, e não havia toast no app pra erros sem campo (ex. e-mail já cadastrado).

## Decisão

Um único utilitário no frontend inspeciona a resposta de erro: se tem `fields`, aplica cada mensagem no `Field` correspondente (chave `_` inclusa, mas sem campo pra anexar — vira toast também); senão, mostra a `message` como toast. Aplicado uniformemente em todo formulário que bate num desses 4 endpoints (login, signup, checkout, upload de redação) — não é uma solução ad hoc do modal de signup.

Descartamos duplicar as regras de validação Zod do backend no frontend via pacote compartilhado (não há workspace/monorepo hoje, `frontend`/`backend` são apps totalmente separados) — as regras de senha ficam duplicadas manualmente no `Field` do frontend pra validação client-side; o contrato `fields`/toast já cobre o caso do backend rejeitar mesmo assim.

## Consequência

Qualquer form novo que bata num endpoint que já usa `Schema` (ou venha a usar) deve consumir esse utilitário em vez de inventar tratamento de erro próprio — é o padrão estabelecido, não uma exceção do signup.
