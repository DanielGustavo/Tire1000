# Toasts + utilitário de erro `fields`/mensagem aplicado em todo formulário

Status: ready-for-agent

Ver ADR-0015.

## Contexto

Não existe nenhum sistema de toast no app hoje (confirmado, zero libs/componentes). Todo erro de API é mostrado como texto vermelho inline dentro do próprio modal/form. O backend já tem uma convenção estabelecida (`Schema`/`FieldsError`, `backend/src/application/controllers/schema.ts`) usada por 4 endpoints — login, signup, checkout de créditos, upload de redação: erro de validação Zod vira `400` com `{ fields: Record<string, string[]> }` (chave `_` pra erro sem campo específico); qualquer outro erro vira `{ message: string }`. O frontend nunca soube dessa distinção. No fluxo de signup especificamente, um erro durante a etapa de seleção de créditos deixa o usuário preso nessa etapa, sem voltar pro form com os valores/erros de campo.

## Escopo

- Adicionar uma lib de toast leve (ex. `sonner`), estilizada pra bater com o design system hand-rolled do projeto (não usar o visual default da lib).
- Utilitário único `applyFieldErrors` (ou nome equivalente): recebe o erro da API, devolve `{ fieldErrors, toastMessage }` — mapeia `fields` pro `Field` correspondente; chave `_` e qualquer erro `message`-only vira toast.
- Aplicar esse utilitário nos 4 pontos que já falam esse contrato no backend: `SignInModal`, `SignUpModal` (form step), `CreditsStep`/checkout, fluxo de upload de redação.
- Signup: em erro durante a etapa de créditos, voltar `step` pra `"form"` — `name`/`email`/`password` já sobrevivem à troca de step de graça (vivem em `useSignUpWizard`, independentes de `step`), só falta aplicar os `fieldErrors` retornados (se houver) nos `Field` certos.
- Regras de senha (mínimo 8, maiúscula, minúscula, dígito — hoje só em `backend/src/application/controllers/auth/signup-schema.ts:7-12`) duplicadas manualmente no frontend pra validação client-side. Sem pacote compartilhado (não há monorepo/workspace configurado).

## Referências

- `backend/src/application/controllers/schema.ts`
- `backend/src/shared/errors/fields-error.ts`
- Endpoints que usam `Schema`: `auth/login-schema.ts`, `auth/signup-schema.ts`, `credits/request-credits-checkout-schema.ts`, `essays/upload-essay-schema.ts`
- `frontend/src/libs/axios.ts:16-21` (`getApiErrorMessage`, hoje só lê `message`)
- `frontend/src/pages/landing/components/useSignUpWizard.ts`, `SignUpModal.tsx`, `CreditsStep.tsx`
