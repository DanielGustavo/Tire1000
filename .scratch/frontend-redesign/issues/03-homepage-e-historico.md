# Homepage: temas em destaque + Suas redações (mobile)

Type: prototype

Blocked by: 01

## Question

Construir a Homepage (mobile) a partir do Figma (frame "Homepage", nó `39:1047`, e "Homepage empty", nó `106:1608`, dentro do canvas Responsive `5:1551`), substituindo `home.tsx` e absorvendo o que hoje é `essay-history.tsx`:

- Header com logo, ícone de notas (atalho pra "Suas redações"?) e ícone de usuário/menu (`User menu`, nó `106:1593`).
- Seção "Temas" — carrossel/lista dos temas mais recentes com botão "Ver todos" → `themes.tsx`.
- Seção "Suas redações" — lista paginada (ver rodapé com paginação numérica) dos envios do usuário, cada item com a cor do eixo (`topicColor`) do tema, e estado visual próprio por `Essay.status`: processando (`VALIDATING`/`EVALUATING`), rejeitada/erro (`REJECTED`/`VALIDATION_FAILED`/`EVALUATION_FAILED`, com ação "Tentar novamente"), e avaliada (`SUCCESS`, mostrando a nota). Consome `GET /essays` (já existe, paginação a confirmar contra o contrato atual da API).
- Estado vazio ("Homepage empty") quando o usuário não tem nenhuma redação enviada ainda.
- price modal (compra de créditos) disparado a partir daqui — mapear o(s) ponto(s) de entrada exato(s) no header/menu.
