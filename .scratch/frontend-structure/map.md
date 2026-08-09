# Consistência de estrutura de arquivos do frontend

## Destination

`frontend/src` reorganizado de forma consistente: nomenclatura uniforme (camelCase fora dos componentes de UI), hooks/tipos/páginas em locais previsíveis e sem módulo morto ou fluxo compartilhado escondido sob `pages/` fingindo ser uma rota. Destino alcançado quando as 10 correções decididas na sessão de charting abaixo estiverem aplicadas.

Achados que originaram o esforço (levantados por leitura direta do código, confirmados com o usuário via `/grilling`):
- `pages/essay-upload/` não é uma rota (ausente de `App.tsx`) mas é importado por `pages/home` e `pages/themes` como fluxo compartilhado.
- `pages/credits.tsx` é a única página sem diretório próprio — e está morta (só referenciada por si mesma e pelo registro de rota; a compra de créditos hoje passa pelo `PriceModal`).
- Hooks acoplados a um componente/sub-fluxo vivem dentro de `components/` em vez de ao lado dele.
- Nomenclatura mista: `kebab-case` em páginas/services/libs/schemas, `camelCase` em hooks, `PascalCase` em componentes.
- Tipos de entidade (`Essay`, `Theme`, `CurrentUser`...) misturados com DTOs de request/response dentro dos arquivos de `services/`.
- `layouts/AppLayout.tsx` define 4 componentes (`Header`, `UserMenu`, `Footer`, `AppLayout`) num único arquivo.
- `hooks/` global tem um único hook solto; nenhuma separação entre hooks de dado (query/mutation) e hooks de comportamento de app.
- Padrão "fechar ao clicar fora" duplicado em 3 lugares (`AppLayout`/`UserMenu`, `Select`, `HighlightedEssayText`).
- `App.tsx` mistura composição raiz (`AuthProvider`/`Toaster`) com definição de guards de rota (`RootRoute`, `RequireAuth`) e a árvore de rotas.

## Notes

- **Exceção às normas padrão do Wayfinder**: este mapa carrega execução, não só decisão — todas as tickets são do tipo `task`, já com a decisão de destino resolvida na sessão de charting (grilling). Cada ticket entrega o código movido/renomeado, não uma pergunta em aberto.
- Convenção de nomenclatura decidida: **camelCase** em todo arquivo/diretório hoje em `kebab-case` (páginas, `services/`, `libs/`, schemas) — **exceto** componentes de UI compartilhados, que continuam `PascalCase` (o nome do arquivo espelha o nome do componente exportado). Assets de imagem ficam fora da regra.
- Convenção de `types/`: forma de entidade/domínio → `types/<entidade>.ts` (um arquivo por entidade, espelhando o nome do service). DTO específico de um único request/response de endpoint → continua no arquivo do `service`.
- Convenção de hooks: hook acoplado a um componente/sub-fluxo de uma página → `pages/<página>/hooks/`. Hook de topo da página (estado da página inteira) → continua na raiz de `pages/<página>/`. Hook que é só um `useQuery`/`useMutation` envolvendo uma chamada de service, sem lógica extra → vira hook global em `hooks/queries/` ou `hooks/mutations/`, nomeado pela ação, expondo a função de ação com nome de domínio (`uploadEssay`, não `mutate`) — não `mutate`/`mutateAsync` genérico. Hook de comportamento de app reutilizável entre componentes (não ligado a dado de servidor) → `hooks/app/`.
- Convenção de teste deste repo (`CLAUDE.md`): não criar teste dedicado para os hooks/movimentações desta ticket a menos que exista lógica genuinamente não-trivial — a maior parte daqui é reorganização mecânica, sem teste novo esperado.
- Vocabulário do domínio em `CONTEXT.md`, caso alguma ticket precise nomear algo (ex.: `Correção`, `Revisão`, `Avaliação`).

## Decisions so far

- [Remover página de créditos não utilizada](issues/01-remover-pagina-creditos.md) — `pages/credits.tsx` e a rota `/credits` removidos de `App.tsx`; `credits-service.ts` mantido (usado por `PriceModal.tsx`); build limpo
- [Mover pages/essay-upload/ para src/flows/essayCapture/](issues/02-mover-essay-upload-para-flows.md) — hook e 5 componentes movidos para `flows/essayCapture/{hooks,components}/`, imports atualizados nos 5 consumidores em `pages/themes`/`pages/home` mais 2 imports internos quebrados corrigidos
- [Dividir AppLayout.tsx em pasta própria](issues/06-dividir-applayout.md) — `layouts/AppLayout.tsx` dividido em `AppLayout/{AppLayout.tsx,components/{Header,UserMenu,Footer}.tsx}`, sem barrel; `Header`/`UserMenu`/`Footer` viram exports nomeados; import em `App.tsx` atualizado
- [Extrair hooks colocalizados em components/ para hooks/ de cada página](issues/03-extrair-hooks-de-components.md) — 4 hooks (`useEssaysSection`, `useEssayResendFlow`, `useEssayUploadFlow`, `useSignUpWizard`) movidos de `components/` para `hooks/` própria em `pages/home`, `pages/themes` e `pages/landing`, imports dos consumidores e do import interno de `signup-schema.ts` atualizados
- [Reestruturar hooks/ global em queries/mutations/app](issues/07-reestruturar-hooks-globais.md) — `hooks/` global dividido em `app/`, `queries/`, `mutations/`; `useIsDesktop` movido sem mudança de conteúdo e extraídos `useThemes`/`useTheme`/`useEssays`/`useEssayDetail`/`useSignUp` dos `useQuery`/`useMutation` inline de cada hook de página, que mantêm sua própria lógica de composição (paginação, URL state, passo do wizard, redirecionamento)
- [Extrair useUploadEssay/useResendEssay como hooks/mutations/](issues/08-extrair-mutations-essay-upload.md) — criados `hooks/mutations/useUploadEssay.ts`/`useResendEssay.ts` envolvendo `essayService.upload|resend` + `uploadPhoto` como mutation única; `pages/themes/hooks/useEssayUploadFlow.ts` e `pages/home/hooks/useEssayResendFlow.ts` passam a chamar `uploadEssayAsync`/`resendEssayAsync` em vez do service direto, mantendo erro/toast e `onSuccess` como estavam

## Not yet specified

- **Duplicação de JSX entre `EssayUploadFlow` (em `pages/themes`) e `EssayResendFlow` (em `pages/home`)**: os dois renderizam quase a mesma cadeia de modais (`TipsModal`/`CameraPermissionModal`/`PhotoConfirmationModal`/`PhotoConfirmationErrorModal`/`PhotoConfirmationLoadingModal`) sobre o mesmo `useEssayCaptureFlow`. É uma decisão de design de componente (dedup de comportamento), não só de onde o arquivo mora — fica em aberto pra uma sessão futura, depois que a reorganização de diretórios deste mapa estiver aplicada.

## Out of scope

- Nenhum item foi descartado do destino até agora — tudo que foi levantado na sessão de charting virou ticket ou ficou em "Not yet specified".
