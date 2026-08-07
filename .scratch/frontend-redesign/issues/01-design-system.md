# Design system: tokens Tailwind + componentes base

Type: prototype

Blocked by: None

Status: resolved

## Question

Extrair do Figma (nó `5:3` "DS" e `33:2` "Components", fileKey `gNZUfCRJ0aiHIkcy5sugtE`) e construir em código:

- **Tokens Tailwind v4** (`frontend/src/index.css`, via `@theme`): cor e tipografia.
  - **Não confiar no frame estático "Tipografia"/"Colors" da aba DS (nó `5:3`) — ele fica desatualizado.** Em vez disso, extrair via `get_variable_defs` nos nós de componentes e telas reais (não na página de documentação): retorna as Variables do Figma vinculadas de verdade, com nome canônico e valor atual — ex. `get_variable_defs` no título da seção "Suas redações" (nó `39:1263`) já devolveu `{"Foundation /Neutral/N900":"#1C211F","title":"Font(family: \"Lato\", style: ExtraBold, size: 31, weight: 800, lineHeight: 1, letterSpacing: 0)"}`. Repetir em alguns nós de texto/cor representativos (Button, Field, títulos de seção de cada tela) até ter o catálogo completo de variáveis de cor (`Foundation /...`) e tipografia usadas.
  - `search_design_system` não encontra nada (o arquivo não tem Text/Color Styles publicados como library) — confirma que Variables é o caminho certo, não Styles.
- **Componentes base reutilizáveis** espelhando os componentes do Figma (nó `33:2`): `Button` (variantes Primary/Neutral/Secondary/Dark × tamanhos Default/Small, com slot de ícone), `Field` (input de texto com estados de erro/ok/senha, label opcional), `Select` (dropdown com estado aberto/fechado), `IconButton` (variantes Default/Dark/Gray), `Bullet` (marcador circular com ícone — usado como indicador de passo, cabeçalho de item, ícone informativo; variantes Default/Dark/Slot/Dark slot).

Como as próximas tickets (todas as telas) vão consumir esses componentes, a questão central é: qual API (props) cada componente expõe, e como os tokens ficam nomeados — isso trava a implementação de tudo que vem depois. Usar `/figma-design-to-code` para extrair o design context de cada componente antes de implementar.

Escopo mobile primeiro — não adaptar os componentes para desktop ainda (isso acontece organicamente conforme os tokens são reaproveitados; se o Figma mostrar um componente com variante específica de desktop, registrar como fog, não implementar agora).

## Answer

Catálogo extraído via `get_variable_defs` nos nós dos 5 componentes (`33:10` Button, `39:98` Field, `106:2237` Select, `106:1461` IconButton, `33:55` Bullet) — não no frame estático `5:3`, que aliás **não é acessível remotamente** (`get_variable_defs` nesse nó devolveu erro "nothing selected", provavelmente por ser um canvas/page-id em vez de frame). Catálogo completo:

- **Cor** (`Foundation /...`): Neutral N0 `#FFFFFF`, N30 `#EDEDED`, N300 `#696C6B`, N700 `#353938`, N900 `#1C211F`; Primary P100 `#81EEB7`, P300 `#25E283`; Alert A300 `#FFE01A`; Error E300 `#E33A24`.
- **Efeitos**: `MyShadow` (2px 2px 0 0 `#1E1E1E`), `MyShadowPink` (2px 2px 0 0 `#EF80BD`) — variante "Dark"/"Dark slot" de todo componente troca a sombra preta pela rosa e a borda preta pela branca (padrão consistente em Button/IconButton/Bullet).
- **Tipografia** (Lato): `title` (ExtraBold 800 / 31px / lh 1), `default - bold` (Bold 700 / 16px / lh 1.2), `default - regular` (Regular 400 / 16px / lh 1.2), `small - regular` (Regular 400 / 13px / lh 1.2).

Tokens em `frontend/src/index.css` via `@theme`: cores como `--color-{neutral,primary,alert,error}-N`; sombras como `--shadow-hard`/`--shadow-hard-pink`; tipografia como `--text-{title,default,small}` (só tamanho+line-height — peso via utilitário `font-bold`/`font-normal` do próprio Tailwind, não bakeado no token, já que "default-bold" e "default-regular" só diferem em peso e duplicar o token não agregava nada sobre usar `font-bold` direto).

Componentes em `frontend/src/components/`: `Button`, `Field`, `Select`, `IconButton`, `Bullet` — API e decisões abaixo.

### Decisões de API

- **Button**: `variant` (primary/neutral/secondary/dark) × `size` (default/small) + `icon?: ReactNode`. O Figma tinha 3 variantes de slot de ícone (`Default`/`True`/`20`) onde `True` só aparece numa única combinação (Primary+Default, ícone 28px) — tratado como caso único não generalizado; o slot unificado usa 20px, que é o padrão em todas as outras combinações Primary/Neutral com ícone.
- **Field**: `label?`, `errors?: string[]`, `success?: string[]`, resto repassado como `InputHTMLAttributes`. Toggle de senha (`type="password"`) é interno (`useState` + ícones `Eye`/`EyeClosed`), não uma prop controlada — o Figma não indicava necessidade de controle externo.
- **Select**: componente controlado (`value`/`onChange`), lista de `options: {value,label}[]`, abre/fecha com `useState` + listener de clique fora. Não é um `<select>` nativo porque o Figma define um dropdown customizado (painel de opções com hover próprio) que um `<select>` nativo não reproduz.
- **IconButton**: `variant` (default/dark/gray) + `icon: ReactNode` obrigatório (sem fallback visual no Figma).
- **Bullet**: `variant` (default/dark/slot/dark-slot) + `children`. **Confirmado por screenshot (`get_screenshot` no nó `33:54`) que o Bullet NÃO é arredondado** — apesar do nome/descrição "circular" na ticket, o Figma renderiza cantos retos (mesma linguagem visual quadrada do Button/Field/IconButton). Implementado sem `rounded-*`, fiel ao pixel real, não à palavra "circular" do enunciado.
- Ícones: como o Figma usa a biblioteca aberta Lucide (camadas nomeadas `lucide/eye`, `lucide/chevron-down` etc., 1:1 com os nomes de componente do pacote `lucide-react`), adicionamos `lucide-react` como dependência em vez de baixar/commitar cada ícone como asset estático — evita URLs de asset expirando em 7 dias e dá suporte a `currentColor`/tamanho via prop.
- Fonte Lato carregada via Google Fonts `<link>` em `index.html` (pesos 400/700/800) — não havia fonte custom carregada antes.

### Fog registrado (não implementado nesta ticket)

- Slot de ícone `size=Default, slot=True` do Button (28px, só Primary+Default) — variante rara, generalizar quando/se aparecer de novo em telas reais.
- Paleta Alert completa e um eventual componente "Toast" — só existe `Foundation /Alert/A300` confirmado; sem evidência de mais tons ou de um componente toast no Components canvas.
- Nenhuma verificação visual em navegador real (sem ferramenta de screenshot de app disponível nesta sessão) — validado por: screenshots do Figma comparados contra as classes Tailwind geradas, `tsc -b`, `oxlint`, e `vite build` limpos.
