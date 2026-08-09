# CamelCase em arquivos e diretórios de página/service/lib/schema

Type: task

Status: resolved

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

## Answer

Todas as 12 renomeações da lista foram aplicadas com `git mv` (arquivo por arquivo, corrigindo os importers logo em seguida em vez de batelar tudo primeiro, dado o blast radius grande):

- `pages/essay-result/` → `pages/essayResult/` (incluindo `essay-result.tsx` → `essayResult.tsx`; `useEssayResultPage.ts` e `components/` moveram junto, sem rename adicional)
- `pages/themes/theme-detail.tsx` → `pages/themes/themeDetail.tsx`
- `pages/landing/components/login-schema.ts` → `loginSchema.ts`
- `pages/landing/components/signup-schema.ts` → `signupSchema.ts`
- `services/{essay,credits,theme,topic,user,auth}-service.ts` → `services/{essay,credits,theme,topic,user,auth}Service.ts`
- `libs/form-errors.ts` → `libs/formErrors.ts`
- `libs/hard-shadow.ts` → `libs/hardShadow.ts`

Consumidores corrigidos (grep no `frontend/src` inteiro por cada specifier antigo, não só pela lista original da ticket, já que ela estava desatualizada em relação aos moves das tickets 02/03/05/07/08/09):
- `App.tsx`: imports de `EssayResultPage` e `ThemeDetailPage` repontados pros novos caminhos.
- `pages/essayResult/essayResult.tsx`: comentário interno que citava `theme-detail.tsx` atualizado pro novo nome (não é import, mas citava o arquivo renomeado por nome).
- `pages/landing/components/{SignInModal,SignUpModal}.tsx` e `pages/landing/hooks/useSignUpWizard.ts`: imports de `login-schema`/`signup-schema` repontados. Os comentários em `loginSchema.ts`/`signupSchema.ts` que citam `backend/src/application/controllers/auth/{login,signup}-schema.ts` foram deixados como estão — referenciam um arquivo do backend, fora do escopo desta ticket.
- 21 arquivos importando de `services/*-service` (hooks de `hooks/queries/`, `hooks/mutations/`, componentes de página e componentes compartilhados, `contexts/AuthContext.tsx`) repontados via `sed` para os 6 novos nomes — todas as ocorrências eram import specifiers simples (`services/essay-service` → `services/essayService` etc.), sem lógica adicional a revisar.
- 7 arquivos importando de `libs/form-errors`/`libs/hard-shadow` repontados. O comentário em `components/Toaster.tsx` que menciona "hard-shadow border" foi deixado — é prosa descrevendo o estilo visual, não uma referência ao arquivo.

Nenhum `components/*.tsx` (page-local ou compartilhado) foi renomeado, nenhum asset de imagem foi tocado, e `services/service.ts`/`libs/{auth,axios,date}.ts` ficaram como estavam, conforme escopo.

Verificação: `npx tsc -b` (com `.tsbuildinfo` removido antes, pra forçar rebuild completo) compilou limpo, sem erros. `npx oxlint` só reportou warnings pré-existentes não relacionados a esta ticket (parâmetros `node` não usados em `themeDetail.tsx`, export de constante em `AuthContext.tsx`). Nenhum teste novo, conforme convenção do `CLAUDE.md` — renomeação mecânica.
