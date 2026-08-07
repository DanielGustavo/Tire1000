# Landing page + Sign in/Sign up (mobile)

Type: prototype

Status: resolved

Blocked by: 01

## Question

Construir a Landing Page pública (mobile) a partir do Figma (seção "Landing Page", nó `207:3672` dentro do canvas Responsive `5:1551`), substituindo as rotas de página inteira `login.tsx`/`signup.tsx` atuais:

- Landing Page (`LP`, nó `14:53`): header com hamburguer, hero, seção "Steps" (como funciona, usa o componente `Bullet`).
- **Sign in modal** (`39:29`) e **Sign up modal** (`39:356`) como overlays sobre a Landing Page, não rotas próprias.
- **price modal** (`207:3516`/`207:3360`) + **stripe** (`207:3468`): o checkout inicial opcional de créditos que o cadastro já dispara hoje no backend (`POST /auth/signup`, ver ADR-0005) — este ticket cobre só a UI desse redirecionamento, não a lógica (já existe).

Decisões a fechar: como o roteamento client-side deve tratar isso (a Landing Page vira `/`? o que acontece com usuário já autenticado que acessa `/`?), e se os modais de Sign in/Sign up usam rota própria (`/login` abre a landing com o modal já aberto) para permitir link direto/compartilhável.

## Answer

Implementado em `frontend/src/pages/landing.tsx` (`LandingPage`, `SignInModal`, `SignUpModal`), `frontend/src/components/Modal.tsx` (shell genérico de overlay/card, promovido ao design system — 1ª ocorrência no Figma, usado 3x nesta tela) e `frontend/src/App.tsx`.

**Roteamento** — resolvido exatamente na direção que a própria ticket sugeria:
- `/` é dono de dois componentes intercambiáveis (`RootRoute`): sem `getAccessToken()` renderiza `LandingPage`; com token, `HomePage` (inalterada). A checagem fica dentro de um componente que o `Routes` do react-router remonta a cada navegação — nunca em `App()` diretamente — pra continuar reativa (token setado durante o fluxo de login/signup precisa refletir sem reload de página).
- `/login` e `/signup` são rotas próprias e compartilháveis: renderizam `LandingPage` com o modal correspondente já aberto (overlay sobre a LP, não uma rota de página inteira). Usuário já autenticado que acessa qualquer uma das duas é redirecionado a `/` (`PublicOnlyRoute`).
- Alternar entre Sign in ↔ Sign up (pelos links do rodapé de cada modal) navega entre `/login` e `/signup` em vez de só troca de estado local — mantém a URL como fonte única de qual modal está aberto.
- Fechar um modal (clique no backdrop ou Esc) navega para `/`, sempre. Isso inclui o modal de créditos (ver abaixo): fechar cancela o cadastro inteiro, sem criar a conta.
- `login.tsx`/`signup.tsx` (rotas de página inteira) foram removidos.

**Cadastro em duas etapas (Sign up + price modal)** — o `SignUpSchema` do backend já aceita `creditsQty` no mesmo payload do `POST /auth/signup` (ADR-0009; a ADR-0005 citada nesta ticket foi substituída — checkout no signup é opt-in via `creditsQty`, não mais automático). Por isso o modal de créditos (nó Figma `207:3360`, "Selecione a quantidade de créditos para iniciar") não é uma tela pós-cadastro, e sim um 2º passo do mesmo formulário: o clique em "Cadastrar conta" só avança o wizard local (guarda nome/email/senha em estado, valida confirmação de senha) — a chamada a `authService.signUp` só acontece depois que o usuário escolhe uma quantidade de créditos (`Iniciar com N créditos`) ou usa o link "Continuar sem comprar créditos agora" (adicionado; o Figma não tinha essa saída, mas a compra é opcional por regra de domínio — sem ela o usuário ficaria travado sem forma de terminar o cadastro sem comprar). Em ambos os casos o `checkoutUrl` de retorno decide o destino: se vier preenchido, `window.location.href` pro Stripe (mesmo padrão já usado em `credits.tsx`); se `null`, `navigate("/")`.

**Preço não exibido nos botões de crédito**: o Figma mostra "R$20,00" fixo nos 3 botões (1, 2 e 3 créditos — mesmo valor pros três, aparentemente placeholder). Preço real só existe no Stripe (ADR-0002, `STRIPE_PRICE_ID` no backend); o frontend não tem de onde buscar R$/crédito. Os botões mostram só a quantidade ("Iniciar com N créditos"), sem preço — mesmo comportamento que `credits.tsx` já tinha.

**Login social (Google)**: os botões "Acessar/Cadastrar-se com Google" existem no Figma (nós dentro de `39:29`/`39:356`) mas não foram implementados — fora de escopo do MVP (ver `map.md`, backend não tem esse fluxo).

**Hamburguer do header**: renderizado (ícone `Menu` do lucide-react, nó `14:56`/`14:57`) mas sem `onClick` — o conteúdo do menu de navegação não está especificado em nenhuma ticket ainda (não existe drawer/menu no Components canvas do Figma visto até agora). Fica como item visual-only até alguma ticket especificar o que ele abre; ver `map.md` "Not yet specified".

**Design system**: tokens novos em `index.css` (`--text-hero`, `--text-subtitle`, `--color-neutral-600`, `--color-alert-100`, `--color-error-100`) e variantes novas em `Bullet` (`alert`, `error`, `info`, `pink`) pros badges de competência C1–C5 da seção "Avaliamos cada Competência" — `info`/`pink` usam hex cru (`#7ad3ff`/`#ef80bd`) porque não são estilos nomeados no Figma (só "C4"/"C5" informais), diferente dos demais que seguem nomes formais "Foundation/...".

**Assets**: logo, textura de grid do hero e ilustração da correção baixados do Figma e commitados em `frontend/src/assets/landing/` (ícones — menu, notepad-text, eye — usam `lucide-react`, não asset exportado, seguindo a decisão da ticket 01).

**Testes**: nenhum teste dedicado foi adicionado. Não há runner de testes configurado no `frontend/` ainda (nem a ticket 01 adicionou); a única lógica não-trivial nova (comparação de senha/confirmação, derivação de step do wizard) é simples o suficiente pra verificar por leitura, e a tela foi validada manualmente via Playwright/Chromium headless (fluxos de signup, mismatch de senha, seleção/skip de créditos, navegação entre modais, redirect de usuário autenticado).
