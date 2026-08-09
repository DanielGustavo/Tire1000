# Landing page + Sign in/Sign up (desktop)

Status: resolved

Type: prototype

Blocked by: 02

## Question

Adaptar a Landing Page + Sign in/Sign up construídas na ticket "Landing page + Sign in/Sign up (mobile)" para o breakpoint desktop, usando o frame "LP - desktop" (nó `106:1831`, canvas Desktop `106:1830`) como referência. O Figma não tem frames de desktop separados para os modais de Sign in/Sign up/price/stripe — confirmar com `get_design_context`/screenshot se eles só crescem responsivamente a partir da versão mobile ou se há algum ajuste de layout (ex.: modal centralizado menor, não full-width) a aplicar.

## Answer

Implementado em `frontend/src/pages/landing/` — `landing.tsx` + `components/{Header,Hero,Steps,Illustration,Cta}.tsx` ganharam classes `lg:` (breakpoint único de desktop escolhido: 1024px, o default do Tailwind — "tablet dedicado" já é fora de escopo do map, então não há necessidade de um segundo corte). `Footer.tsx`, `AuthDivider.tsx`, `CreditsStep.tsx` e o wizard de signup não precisaram de nenhuma mudança.

**Decisão sobre os modais (a pergunta central da ticket)**: nenhuma mudança foi necessária. `components/Modal.tsx` (construído na ticket 02) já limita a caixa a `max-w-[377px]` centralizada via flexbox sobre um backdrop `fixed inset-0` — ou seja, o comportamento "modal centralizado menor, não full-width" que o Figma pede pro desktop já era o comportamento em qualquer largura de viewport, mobile ou desktop. `SignInModal`, `SignUpModal`, `CreditsStep`, `AuthDivider` continuam exatamente como estavam.

**Mudanças de layout por seção** (via `get_metadata`/`get_design_context`/screenshot do nó `106:1831`, escopados a esse nó específico):
- **Header**: hambúrguer (só visual, sem `onClick`, ver map "Not yet specified") vira a logo em `lg:`; ganha um segundo botão "Criar uma conta" (`Button variant="primary" size="small"`) ao lado do "Entrar" existente — `Header` passou a receber `onSignUp` também.
- **Hero**: logo cresce de 238×213 pra 309×276; botão de CTA ganha `lg:h-16` (64px, confirmado no dump do Figma). Tamanhos de texto (`text-hero`/`text-default`) não mudam — o Figma usa o mesmo type scale em mobile e desktop, só com quebras de linha manuais fixas (mantidas sem alteração).
- **Steps**: no Figma desktop cada item da lista vira um cartão escuro (`bg-neutral-900`, borda `neutral-0`, `shadow-hard-pink`, texto branco) em vez de ficar liso sobre o fundo amarelo — diferença real de estilo, não só de largura, confirmada pelo `get_design_context` (bullets continuam `variant="dark"`, já corretos nas duas larguras). O título da seção também sobe de `text-title` (31px) pra `text-hero` (39px) em `lg:`. A faixa amarela vira edge-to-edge (sem margem lateral) e a lista interna passa a ter teto de 700px centralizado.
- **Illustration**: título vira uma linha só em vez de 3 linhas forçadas (`<br className="lg:hidden">` com espaço explícito via `{" "}` pra não colar as palavras); as 5 competências viram grid de 2 colunas (`lg:grid lg:grid-cols-2`) em vez de lista empilhada.
- **Cta**: o cartão rosa vira largura fixa de 372px centralizada (`lg:max-w-[372px]`) em vez de full-width.
- Página inteira ganhou `lg:max-w-[1280px] lg:mx-auto` no container raiz (`landing.tsx`) — o frame do Figma tem exatamente 1280px de largura; sem esse teto o header (com `justify-between`) e o heading/grid da Illustration esticariam de forma estranha em monitores mais largos que 1280px. Isso surgiu como achado real do `/code-review` (eixo Spec) e foi corrigido antes do commit.

**`/code-review` (`since 3145b5a`)**: eixo Standards não achou violação de padrão documentado, só 2 smells de julgamento (não corrigidos, ambos de baixo risco): os cartões escuros do Steps reimplementam inline o mesmo visual do variant `"dark"` já existente em `Button`/`Bullet` em vez de extrair um padrão compartilhado; e o diff introduz vários valores de pixel arbitrários novos (`72px`, `372px`, `276px/309px`, `374px`, `700px`) sem token — consistente com a convenção já usada no restante do código (`h-[213px]` etc.), mas vale observar se crescer nas próximas tickets de desktop. Eixo Spec achou 1 problema real (falta de teto de largura — corrigido, ver acima) e 2 pontos "parece errado mas não é" que na verificação contra o dump bruto do Figma se confirmaram corretos (cantos quadrados nos cartões do Steps — sem `rounded-*` em lugar nenhum do Figma; `lg:h-16` no botão do Hero — o Figma tem `h-[64px]` explícito).

**QA manual no navegador não foi possível** (mesma limitação de tickets anteriores do map, ex. 04/06/07) — sem ferramenta de automação de browser disponível nesta sessão. Validado só por `tsc -b`, `oxlint` e `vite build` limpos, e pela revisão de código acima — não houve conferência visual real em um browser rodando.
