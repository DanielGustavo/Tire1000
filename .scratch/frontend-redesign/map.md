# Frontend do zero a partir do Figma

## Destination

O frontend (`frontend/`) reconstruído do zero a partir do design no Figma (arquivo "Tire-Mil", fileKey `gNZUfCRJ0aiHIkcy5sugtE`) — mobile-first primeiro, depois um passe de adaptação para desktop. Um design system extraído do Figma (tokens Tailwind de cor/tipografia + componentes base: Button, Field, Select, IconButton, Bullet) é a fundação sobre a qual toda tela é construída.

A informação de arquitetura (IA) segue o Figma, não as rotas atuais:
- Uma **Landing Page pública** nova, com **Sign in**/**Sign up** como modais sobre ela — substitui as rotas de página inteira `login.tsx`/`signup.tsx`.
- A **Homepage** passa a incluir a lista paginada de "Suas redações" (com os estados de processando/rejeitada/avaliada) — absorve o que hoje é `essay-history.tsx`, que deixa de ser uma rota separada.
- A compra de créditos vira o fluxo **price modal + redirect Stripe**, sem página avulsa — `credits.tsx` deixa de ser uma rota separada.
- `themes.tsx`, `theme-detail.tsx`, `essay-upload.tsx` (fluxo de câmera/upload) e `essay-result.tsx` (Correção) continuam existindo como telas próprias, reconstruídas visualmente.

Destino alcançado quando as 6 telas/fluxos abaixo estiverem implementadas batendo com o Figma, em mobile e em desktop:
1. Landing + autenticação (Sign in/Sign up modais)
2. Homepage (Temas em destaque + Suas redações paginado)
3. Listagem de temas (+ filtro)
4. Detalhe do tema (+ variante sem crédito)
5. Envio de redação (fluxo de câmera no mobile, fluxo de upload de arquivo no desktop — ambos entram por um modal de dicas)
6. Correção — resultado da Revisão/Avaliação (+ estados in-progress/loading)

## Notes

- **Exceção às normas padrão do Wayfinder**: este mapa carrega execução, não só decisão — cada ticket entrega a tela construída em código (mergeada em `frontend/`), não um documento de decisão. O usuário quer o frontend pronto ao final do mapa.
- Arquivo Figma: fileKey `gNZUfCRJ0aiHIkcy5sugtE` ("Tire-Mil"). Nós de referência: Design System `5:3`, Assets `5:1268`, Components `33:2`, Responsive/mobile `5:1551`, Desktop `106:1830`.
- Sempre carregar a skill `figma-design-to-code` antes de chamar `get_design_context`.
- Sempre invocar `/grilling` e `/domain-modeling` quando a resolução de uma ticket envolver decisão de comportamento/estado, não só estilo puro.
- Vocabulário do domínio em `CONTEXT.md` (Correção, Revisão, Avaliação, Eixo, Destaque). Contrato de API e casos de uso já implementados: `.scratch/tire1000-mvp/spec.md`.
- Convenção de teste deste repo (`CLAUDE.md`): testes vivem na camada de application; UI pura normalmente não pede teste dedicado — não criar teste de componente só porque existe uma tela nova, a menos que haja lógica não-trivial.
- `get_metadata` nos nós `5:1551` (mobile) e `106:1830` (desktop) sozinhos estoura o limite de tokens da ferramenta — ao abrir uma ticket, peça `get_metadata`/`get_design_context` só do nó da seção/tela específica, não do canvas inteiro.

## Decisions so far

- **[01-design-system](issues/01-design-system.md)**: design system implementado em `frontend/src/index.css` (tokens `@theme`: cor, sombra "hard" 2px, tipografia título/default/small) + `frontend/src/components/{Button,Field,Select,IconButton,Bullet}.tsx`. Peso de fonte via utilitário Tailwind (`font-bold`), não bakeado no token de tamanho. Ícones via `lucide-react` (novo devDep — os nomes de camada do Figma batem 1:1 com o pacote). Bullet confirmado **não-circular** por screenshot real do Figma, apesar do nome sugerir círculo — implementado com cantos retos. Fonte Lato via Google Fonts `<link>` em `index.html`.

## Not yet specified

- Inventário completo de componentes-base ainda não descobertos no Figma (shell de modal/dialog, toast/alerta — existe paleta "Alert" no DS mas nenhum componente "Toast" no Components canvas ainda visto, paginação, card de redação/tema) — promover ao design system conforme cada ticket de tela for resolvido e o padrão se repetir.
- Pontos de entrada exatos do "price modal" de compra de créditos (Homepage, fluxo de tema sem crédito, Correção — o Figma mostra o modal repetido em várias seções) — fechar por tela, na ticket correspondente.
- Fallback de permissão de câmera negada no mobile (os modais "Camera permission revoked/accepted" existem no Figma, lógica de retry ainda não conversada) — cai dentro da ticket de envio de redação.
- Exportação de assets/ilustrações (nó `5:1268`) — ainda não inventariado; abrir quando alguma tela precisar de um asset específico.

## Out of scope

- Breakpoint de tablet dedicado — só mobile e desktop; o meio-termo fica por herança natural do CSS responsivo.
- Mudanças de lógica de negócio/casos de uso do backend — este mapa é só frontend visual e estrutural sobre as APIs já existentes (ver `.scratch/tire1000-mvp/spec.md`).
- Login social (Google) — já fora de escopo do MVP (ver spec do backend).
- Paginação/rate limiting de API — contrato de backend já definido; o frontend só consome o que existe.
