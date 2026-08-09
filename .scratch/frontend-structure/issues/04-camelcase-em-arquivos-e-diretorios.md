# CamelCase em arquivos e diretórios de página/service/lib/schema

Type: task

Status: open

## Question

Padronizar em `camelCase` os arquivos e diretórios que hoje estão em `kebab-case`. **Não inclui** componentes de UI compartilhados (`components/*.tsx`, `pages/*/components/*.tsx`) — esses continuam `PascalCase`, espelhando o nome do componente exportado (convenção React padrão, decidida explicitamente fora de escopo desta ticket). Também não inclui assets de imagem.

Renomear:
- `frontend/src/pages/essay-result/` → `frontend/src/pages/essayResult/`
  - `essay-result.tsx` → `essayResult.tsx`
  - `useEssayResultPage.ts` já está em camelCase, só muda de diretório
  - `components/` já está em PascalCase, só muda de diretório
- `frontend/src/pages/themes/theme-detail.tsx` → `frontend/src/pages/themes/themeDetail.tsx` (o diretório `themes/` já é uma palavra só, não precisa mudar)
- `frontend/src/pages/landing/components/login-schema.ts` → `loginSchema.ts`
- `frontend/src/pages/landing/components/signup-schema.ts` → `signupSchema.ts`
- `frontend/src/services/essay-service.ts` → `essayService.ts`
- `frontend/src/services/credits-service.ts` → `creditsService.ts`
- `frontend/src/services/theme-service.ts` → `themeService.ts`
- `frontend/src/services/topic-service.ts` → `topicService.ts`
- `frontend/src/services/user-service.ts` → `userService.ts`
- `frontend/src/services/auth-service.ts` → `authService.ts`
  (`services/service.ts` já está ok, sem hífen)
- `frontend/src/libs/form-errors.ts` → `formErrors.ts`
- `frontend/src/libs/hard-shadow.ts` → `hardShadow.ts`
  (`libs/auth.ts`, `libs/axios.ts`, `libs/date.ts` já estão ok)

Depois de renomear, atualizar **todos** os imports afetados em todo `frontend/src` — são muitos consumidores (toda página/componente que usa um `*-service`). Rode `tsc -b` no frontend ao final; qualquer import quebrado vira erro de compilação, é a forma mais confiável de pegar os que passaram batido.

Se as tickets [Extrair tipos de entidade dos services para types/](05-extrair-types-de-services.md), [Reestruturar hooks/ global](07-reestruturar-hooks-globais.md) ou [Extrair useUploadEssay/useResendEssay](08-extrair-mutations-essay-upload.md) já tiverem sido resolvidas quando esta rodar, os arquivos de `services/` podem já ter conteúdo diferente (tipos/lógica movidos pra fora) — a rename continua igual, só aplique aos arquivos como estiverem no momento.
