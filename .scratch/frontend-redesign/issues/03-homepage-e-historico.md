# Homepage: temas em destaque + Suas redações (mobile)

Type: prototype

Status: resolved

Blocked by: 01

## Question

Construir a Homepage (mobile) a partir do Figma (frame "Homepage", nó `39:1047`, e "Homepage empty", nó `106:1608`, dentro do canvas Responsive `5:1551`), substituindo `home.tsx` e absorvendo o que hoje é `essay-history.tsx`:

- Header com logo, ícone de notas (atalho pra "Suas redações"?) e ícone de usuário/menu (`User menu`, nó `106:1593`).
- Seção "Temas" — carrossel/lista dos temas mais recentes com botão "Ver todos" → `themes.tsx`.
- Seção "Suas redações" — lista paginada (ver rodapé com paginação numérica) dos envios do usuário, cada item com a cor do eixo (`topicColor`) do tema, e estado visual próprio por `Essay.status`: processando (`VALIDATING`/`EVALUATING`), rejeitada/erro (`REJECTED`/`VALIDATION_FAILED`/`EVALUATION_FAILED`, com ação "Tentar novamente"), e avaliada (`SUCCESS`, mostrando a nota). Consome `GET /essays` (já existe, paginação a confirmar contra o contrato atual da API).
- Estado vazio ("Homepage empty") quando o usuário não tem nenhuma redação enviada ainda.
- price modal (compra de créditos) disparado a partir daqui — mapear o(s) ponto(s) de entrada exato(s) no header/menu.

## Answer

`frontend/src/pages/home.tsx` reescrito do zero (substitui o placeholder antigo e absorve `essay-history.tsx`, que foi deletado — rota `/essays` removida de `App.tsx`, o link "Minhas redações" em `essay-result.tsx` agora aponta pra `/`).

- **Ícone de notas do header = saldo de créditos, não atalho pra "Suas redações"** (a ticket tinha isso como pergunta em aberto). Confirmado com o usuário: é o único ponto de entrada pro price modal no header/menu — o User menu (`106:1593`) só tem "Sair", sem link de créditos. Badge mostra `userService.getCurrentUser().credits`; clique abre `components/PriceModal.tsx` (novo, reaproveita o padrão visual do `CreditsStep` de `landing-auth-modals.tsx` — ícones `NotepadText` empilhados por quantidade, sem preço no botão per ADR-0002) — chama `creditsService.requestCheckout` e redireciona pro Stripe, mesmo fluxo do signup. Nó `207:3516` do Figma ("price modal") confirmou o padrão de 1/2/3 créditos.
- **Paginação é 100% client-side.** `GET /essays` não pagina (fora de escopo do backend, ver spec) — a Homepage busca a lista inteira e pagina em memória (`ESSAYS_PER_PAGE = 5`), como já decidido em `map.md`.
- **`GET /essays` não devolvia `finalScore`** (DTO travado por teste explícito "no evaluation leaked into the history list"), mas o Figma mostra a nota em cada card avaliado. Confirmado com o usuário: adicionar `finalScore: number | null` ao `EssayDTO`/`toEssayDTO` (mudança aditiva, não mexe em regra de negócio) — testes de `list-user-essays` e `get-essay-detail` atualizados.
- **Classificação visual por status** não seguiu ao pé da letra o agrupamento solto da ticket (que teria `EVALUATION_FAILED` com "Tentar novamente") — usei a regra de negócio já implementada e testada em `essay-result.tsx` (`RESENDABLE_STATUSES`, promovida pra `essay-service.ts` junto com `REJECTION_REASON_LABELS` pra reuso): `EVALUATION_FAILED` não é reenviável (crédito não devolvido, ADR-0001, reprocessa via DLQ) — mostra só o chevron pra ver detalhe, sem botão de retry. `UPLOADING` (upload abandonado) entra no grupo "erro reenviável" pelo mesmo motivo que em `essay-result.tsx`.
- **Novo componente `components/TexturedCard.tsx`** — o cartão com textura de pontos + fundo colorido (tema OU redação avaliada) ou preto (redação em processamento/erro) se repete nos dois carrosséis; promovido a componente de design system como o `map.md` já antecipava ("card de redação/tema" na seção Not yet specified). Texturas baixadas do Figma pra `frontend/src/assets/card-texture{,-dark}.png`.
- **`Bullet` ganhou `size?: "fixed" | "auto"`** (default `"fixed"` preserva o uso atual na landing) — os badges desta ticket ("ENEM 2025", nota, "???") têm largura variável, não o quadrado 51px fixo. Variante `"white"` nova (bg branco, usada no badge de nota da redação avaliada). **`IconButton` ganhou `rotate?: "left" | "right"`**, espelhando o `Bullet` (mesmo motivo de drop-shadow em vez de box-shadow quando rotacionado) — a lógica de shadow rotacionado (antes só em `Bullet.tsx`) foi extraída pra `frontend/src/libs/hard-shadow.ts`, reaproveitada por `Bullet`, `IconButton` e o ícone de status "!"/"X" em `home.tsx` (3 usos, não fazia sentido duplicar de novo).
- **Tokens novos em `index.css`**: `--color-neutral-20` (#F6F6F6, bg do header), `--color-neutral-200` (#777A79, texto do estado vazio), `--color-neutral-500` (#505453, número de página inativo na paginação) — extraídos via `get_variable_defs` nos nós reais, mesmo processo da ticket 01.
- **Badge de créditos aparece mesmo no estado vazio**, diferente do frame "Homepage empty" do Figma (que só tem o ícone de usuário). Tratado como inconsistência do mock, não decisão de produto — um usuário novo sem redações ainda mais precisa de acesso rápido a créditos.
- Verificado rodando o dev server real (`vite`) com respostas de API mockadas via Playwright (`page.route`) cobrindo os 4 estados visuais (processando, erro reenviável, erro não-reenviável, avaliada) + paginação + estado vazio + price modal + user menu — sem erros de console.
