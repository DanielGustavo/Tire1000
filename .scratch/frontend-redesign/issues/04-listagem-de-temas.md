# Listagem de temas + filtro (mobile)

Type: prototype

Blocked by: 01

## Question

Construir a tela de listagem de temas (mobile) a partir do Figma (seção "Listagem de temas", nó `207:3674`, canvas Responsive `5:1551`), substituindo `themes.tsx`:

- Frame "Temas" (`106:2006`): busca por título, filtro por eixo (`Tags List`, nó `106:2298`), lista de temas ordenada por data de publicação — consome `GET /themes?topicId=&search=`.
- **Themes filter modal** (`106:2191`): modal de seleção de eixo (`ListTopics`, `GET /topics`).

Decisão a fechar: o filtro por eixo é só o modal, ou também existem os chips/tags inline visíveis na própria listagem (a `Tags List` do frame "Temas" já parece cobrir isso sem precisar abrir o modal) — checar com `get_design_context` se o modal é uma tela de opções extra (mobile, espaço reduzido) ou redundante com os chips.
