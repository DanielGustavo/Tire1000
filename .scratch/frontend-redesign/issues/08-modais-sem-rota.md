# Refactor: modais sem rota dedicada

Type: task

Blocked by: 07

Status: resolved

## Question

Migrar as 3 rotas que hoje existem só pra abrir um modal (`/essays/new`, `/login`, `/signup`) pro padrão de estado local já estabelecido pelo reenvio da ticket 07 (`EssayResendFlow`/`EssayCard`) — sem rota dedicada, montagem condicional por `useState` no componente que dispara o fluxo, em vez de `navigate()`/`<Link>` pra uma rota cujo único propósito é mostrar o modal.

## Answer

- **`/essays/new`** (`EssayUploadPage`/`useEssayUploadPage.ts`, ambos em `pages/essay-upload/`) removido. O flow de captura (câmera/upload, ticket 06) virou `EssayUploadFlow.tsx`/`useEssayUploadFlow.ts` em `pages/themes/components/` — mesma forma da `EssayResendFlow`/`useEssayResendFlow` da ticket 07, agora disparado por `useThemeDetailPage.ts` (`uploadMode: EssayUploadMode | null`) a partir dos 2 CTAs de `theme-detail.tsx` ("Tirar foto"/"Fazer upload"). Sucesso de upload continua navegando pra Home (`navigate("/")`) — isso é navegação real pra "onde o resultado aparece", não fechamento de modal, então ficou como estava.
- **`/login`/`/signup`** removidos, junto com `PublicOnlyRoute` (a guarda "redireciona pra `/` se já autenticado" ficou redundante — `LandingPage` só é renderizada pelo `RootRoute` quando deslogado, então esse caminho nunca era alcançável a partir dela). `LandingPage` ganhou estado local `authModal: "signin" | "signup" | null`, repassado como callback pros pontos de entrada (`Header`/`Hero`/`Cta`, que trocam `<Link to="/login|/signup">` por `onClick`) e pros modais (`SignInModal`/`SignUpModal`, que trocam o `<Link>` de alternar entre si por `onSwitchToSignUp`/`onSwitchToSignIn`). Fechar o modal (backdrop/Esc) chama o `onClose` local em vez de `navigate("/")`.
- Sucesso de login/signup continua chamando `navigate("/")` mesmo já estando em `/` — necessário pra forçar o `RootRoute` a reavaliar `getAccessToken()` (não há estado/contexto de auth reativo neste app, só leitura de `localStorage` no render). Mesmo padrão já usado no sign-out de `AppLayout.tsx`, que também navega pra `/` estando às vezes já na Home.
- Nenhuma rota nova ganhou URL própria — os 3 fluxos deixam de ser navegáveis/bookmarkable diretamente, que é o comportamento pedido: eram artefatos de implementação (rota só pra empilhar modal), não telas reais do Figma.
- Sem teste dedicado (`CLAUDE.md`): mudança é só de UI/roteamento, sem lógica não-trivial nova — validado por `tsc -b`/`oxlint` limpos.
- **Achado do `/code-review`** (corrigido): `useThemeDetailPage.ts` expunha `themeId: themeId!` (assertion sobre o param cru da rota) pro `EssayUploadFlow`, em vez do `themeQuery.data.theme.id` já validado que a `navigate()` antiga usava. Trocado por `uploadThemeId: themeQuery.data?.theme.id`, com o render do flow guardado por `uploadMode && uploadThemeId`.
- **Sugestão do `/code-review` não aplicada agora** (fora do escopo desta ticket, registrada como follow-up): a pasta `pages/essay-upload/` não hospeda mais uma rota/página própria — só os modais (`components/`) e `useEssayCaptureFlow.ts`, agora consumidos por `pages/themes/` e `pages/home/`. O nome ficou como artefato histórico; renomear pra algo como `essay-capture/` (fora de `pages/`) é cosmético e tocaria ~10 arquivos de import, sem risco funcional — vale um passe futuro dedicado, não misturado com este.
