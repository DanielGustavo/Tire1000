# Reestruturar hooks/ global em queries/mutations/app

Type: task

Status: resolved

## Question

A pasta global `frontend/src/hooks/` hoje só tem `useIsDesktop.ts`. Dividir em três subpastas e extrair pra ela todo hook de página que hoje é *só* um `useQuery`/`useMutation` envolvendo uma chamada de service, sem lógica extra de composição:

- `frontend/src/hooks/app/useIsDesktop.ts` (só muda de lugar, sem mudança de conteúdo)
- `frontend/src/hooks/queries/useThemes.ts` — extraído de `pages/themes/useThemesPage.ts`:
  ```ts
  useQuery({
    queryKey: ["themes", { topicId, search }],
    queryFn: () => themeService.list({ topicId: topicId || undefined, search: search || undefined }),
  })
  ```
  assinatura: `useThemes({ topicId, search }: { topicId?: string; search?: string })`. `useThemesPage.ts` passa a chamar esse hook em vez de `useQuery` direto, mantendo paginação/URL state como estão.
- `frontend/src/hooks/queries/useTheme.ts` — extraído de `pages/themes/useThemeDetailPage.ts`:
  ```ts
  useQuery({ queryKey: ["theme", themeId], queryFn: () => themeService.getById(themeId!), enabled: Boolean(themeId) })
  ```
  assinatura: `useTheme(themeId: string | undefined)`.
- `frontend/src/hooks/queries/useEssays.ts` — extraído de `pages/home/components/useEssaysSection.ts` (após a ticket [Extrair hooks colocalizados](03-extrair-hooks-de-components.md), vive em `pages/home/hooks/useEssaysSection.ts`):
  ```ts
  useQuery({
    queryKey: ["essays"],
    queryFn: () => essayService.list(),
    refetchInterval: (query) => query.state.data?.essays.some(essay => PENDING_STATUSES.includes(essay.status)) ? 30000 : false,
  })
  ```
- `frontend/src/hooks/queries/useEssayDetail.ts` — extraído de `pages/essay-result/useEssayResultPage.ts`:
  ```ts
  useQuery({
    queryKey: ["essay", essayId],
    queryFn: () => essayService.getById(essayId!),
    enabled: Boolean(essayId),
    refetchInterval: (query) => query.state.data && PENDING_STATUSES.includes(query.state.data.essay.status) ? 30000 : false,
  })
  ```
  assinatura: `useEssayDetail(essayId: string | undefined)`.
- `frontend/src/hooks/mutations/useSignUp.ts` — extraído do `signUpMutation` em `pages/landing/components/useSignUpWizard.ts` (após a ticket 03, `pages/landing/hooks/useSignUpWizard.ts`). Expor a função de ação com nome de domínio: `{ signUp, signUpAsync, ...resto do estado da mutation }` (renomeando `mutate`/`mutateAsync`), não `mutate` genérico.

Cada hook de página passa a chamar o hook global correspondente em vez de `useQuery`/`useMutation` direto, mantendo toda lógica de estado que é exclusiva da página (paginação, filtros de URL, passo do wizard, redirecionamento) onde já está.

Esta ticket não mexe nas mutations de upload/reenvio de redação (`essayService.upload`/`resend`/`uploadPhoto`) — essas são escopo da ticket [Extrair useUploadEssay/useResendEssay](08-extrair-mutations-essay-upload.md), que depende da estrutura de pastas criada aqui.

## Answer

Criadas `frontend/src/hooks/{app,queries,mutations}/`:

- `git mv src/hooks/useIsDesktop.ts src/hooks/app/useIsDesktop.ts` (conteúdo intocado). Único importer, `pages/themes/useThemesPage.ts`, atualizado para o novo caminho.
- `hooks/queries/useThemes.ts` — `useThemes({ topicId, search })`, extraído tal qual do `useQuery` que vivia em `useThemesPage.ts`. `useThemesPage.ts` agora chama `useThemes({ topicId, search })` e mantém toda a lógica de paginação/URL state (`searchParams`, `withoutPage`, reset de página no breakpoint) como estava.
- `hooks/queries/useTheme.ts` — `useTheme(themeId)`, extraído de `useThemeDetailPage.ts` (mesma `queryKey`/`queryFn`/`enabled`). `useThemeDetailPage.ts` passou a chamar `useTheme(themeId)`, mantendo modal de preço/redirecionamento de upload como estavam.
- `hooks/queries/useEssays.ts` — `useEssays()`, extraído de `pages/home/hooks/useEssaysSection.ts` (mesma `queryKey`/`queryFn`/`refetchInterval` de polling de pendentes). `useEssaysSection.ts` mantém paginação local e agora só chama `useEssays()`.
- `hooks/queries/useEssayDetail.ts` — `useEssayDetail(essayId)`, extraído de `pages/essay-result/useEssayResultPage.ts` (mesma `queryKey`/`queryFn`/`enabled`/`refetchInterval`). `useEssayResultPage.ts` mantém o redirecionamento de status bloqueado e agora só chama `useEssayDetail(essayId)`.
- `hooks/mutations/useSignUp.ts` — `useSignUp()`, um `useMutation` fino sobre `authService.signUp(input: SignUpInput)`, expondo `{ signUp, signUpAsync, ...resto do estado da mutation }` (renomeando `mutate`/`mutateAsync`). `pages/landing/hooks/useSignUpWizard.ts` mantém toda a lógica de composição que era exclusiva da página — montar o `SignUpInput` a partir de `form.getValues()`, e o `onSuccess`/`onError` que mexe em `step`, `serverFieldErrors`, tokens e navegação — passando isso via `signUp(input, { onSuccess, onError })` no lugar de `onSuccess`/`onError` fixos no `useMutation`. O hook de página continua expondo `signUpMutation` com a mesma forma consumida por `SignUpModal.tsx` (`.mutate(creditsQty)`, `.isPending`), então o componente não precisou mudar.

Fora de escopo mantido intocado: `useEssayUploadFlow.ts` e `useEssayResendFlow.ts` (ticket 08).

`npx tsc -b` limpo depois das mudanças. Nenhum teste novo criado (reorganização mecânica de wrappers finos de `useQuery`/`useMutation`, sem lógica nova).
