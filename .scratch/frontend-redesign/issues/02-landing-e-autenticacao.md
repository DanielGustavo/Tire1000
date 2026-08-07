# Landing page + Sign in/Sign up (mobile)

Type: prototype

Blocked by: 01

## Question

Construir a Landing Page pública (mobile) a partir do Figma (seção "Landing Page", nó `207:3672` dentro do canvas Responsive `5:1551`), substituindo as rotas de página inteira `login.tsx`/`signup.tsx` atuais:

- Landing Page (`LP`, nó `14:53`): header com hamburguer, hero, seção "Steps" (como funciona, usa o componente `Bullet`).
- **Sign in modal** (`39:29`) e **Sign up modal** (`39:356`) como overlays sobre a Landing Page, não rotas próprias.
- **price modal** (`207:3516`/`207:3360`) + **stripe** (`207:3468`): o checkout inicial opcional de créditos que o cadastro já dispara hoje no backend (`POST /auth/signup`, ver ADR-0005) — este ticket cobre só a UI desse redirecionamento, não a lógica (já existe).

Decisões a fechar: como o roteamento client-side deve tratar isso (a Landing Page vira `/`? o que acontece com usuário já autenticado que acessa `/`?), e se os modais de Sign in/Sign up usam rota própria (`/login` abre a landing com o modal já aberto) para permitir link direto/compartilhável.
