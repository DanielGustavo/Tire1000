# Melhorias gerais da plataforma (antes do suporte a desktop)

## Destino

Uma leva de ajustes de arquitetura e UX levantados pelo usuário antes de retomar as tickets de suporte a desktop (`.scratch/frontend-redesign/`). Fechado via `/grilling` em duas rodadas — decisões abaixo, uma ticket por unidade de trabalho independente.

## Notes

- Vocabulário do domínio em `CONTEXT.md` — nada aqui introduz termo de domínio novo (tudo é infraestrutura/UI: auth, toasts, polling), então `CONTEXT.md` não foi tocado.
- ADRs registradas em `docs/adr/`: `0013` (refresh token + header de auth na classe `Service`), `0014` (`AuthContext` como fonte de verdade da sessão), `0015` (erros `fields` do backend mapeados pro `Field`, fallback em toast).
- Convenção de teste deste repo (`CLAUDE.md`): testes vivem na camada de application; UI pura normalmente não pede teste dedicado.
- Sem numeração compartilhada com `.scratch/frontend-redesign/` de propósito — é um esforço com destino diferente (polimento geral, não paridade com o Figma).

## Decisions so far

- **[01-refresh-token-e-service](issues/01-refresh-token-e-service.md)**: novo `POST /auth/refresh` no backend + interceptor de resposta no frontend (401 → refresh → reexecuta 1x → logout se falhar). Header `Authorization` e a lógica de refresh migram de `libs/axios.ts` pra dentro da classe base `Service`. Ver ADR-0013.
- **[02-auth-context-e-guarda-de-rota](issues/02-auth-context-e-guarda-de-rota.md)**: `AuthProvider` único substitui as 4 queries de `/me` e vira fonte de verdade de sessão; `RequireAuth` guarda `/themes`, `/themes/:id`, `/essays/:id`, `/credits`, redirecionando pra `/` sem preservar destino. Ver ADR-0014.
- **[03-toasts-e-erros-de-formulario](issues/03-toasts-e-erros-de-formulario.md)**: lib de toast (ex. `sonner`), tematizada; utilitário único mapeia `fields` do backend pro `Field` certo, com fallback em toast — aplicado em login, signup, checkout de créditos e upload de redação. Regras de senha duplicadas no front (sem pacote compartilhado). Ver ADR-0015.
- **[04-modal-fecha-no-botao-voltar](issues/04-modal-fecha-no-botao-voltar.md)**: suporte a fechar modal via botão voltar do navegador/celular, construído uma vez dentro do `Modal` compartilhado.
- **[05-estados-de-interacao-button-field-select](issues/05-estados-de-interacao-button-field-select.md)**: `Button` ganha `loading` (bloqueia clique, não parece desabilitado visualmente) + hover/active/disabled consistentes; `Field`/`Select` ganham hover/focus/disabled consistentes, e `Select` ganha `loading` (usado no eixo do `ThemesFilterModal` enquanto os tópicos carregam).
- **[06-cards-clicaveis-e-label-de-retry](issues/06-cards-clicaveis-e-label-de-retry.md)**: `EssayCard`/`ThemeCard` viram link real (stretched link, suporta clique do meio); `EssayCard` não é clicável nos status com retry inline nem em `EVALUATION_FAILED`. Label "Tentar novamente" durante `UPLOADING` corrigido (não é retry de verdade).
- **[07-select-sem-autofoco-no-mobile](issues/07-select-sem-autofoco-no-mobile.md)**: `Select` para de forçar foco no input de busca em dispositivos touch (`matchMedia("(pointer: coarse)")`), mantendo em desktop.
- **[08-persistencia-de-paginacao-e-filtro-de-temas](issues/08-persistencia-de-paginacao-e-filtro-de-temas.md)**: `search`/`topicId`/`page` de `/themes` viram query string; voltar do detalhe do tema usa `navigate(-1)`; scroll pro topo ao trocar de página.
- **[09-ctas-fixos-na-pagina-do-tema](issues/09-ctas-fixos-na-pagina-do-tema.md)**: botões de CTA da página de tema com `position: sticky; bottom: 0`.
- **[10-polling-de-status-pendente](issues/10-polling-de-status-pendente.md)**: polling da tela de correção relaxado de 2s pra 30s; Home ganha polling de 30s quando há redação não finalizada.
- **[11-polimento-de-navegacao-e-copy](issues/11-polimento-de-navegacao-e-copy.md)**: rodapé fixo no fundo da página, logo do header linka pra home, envio de redação redireciona pra `/essays/:id`, copy dos avisos acima do card de redação mais amigável.

## Out of scope

- Tickets de suporte a desktop (`.scratch/frontend-redesign/`, 08-13) — retomadas depois desta leva.
- Cookie `httpOnly` pra tokens de auth (ADR-0013) — fica pra quando/se XSS virar preocupação real.
- Pacote compartilhado frontend/backend pra schemas Zod (ADR-0015) — regras de senha duplicadas manualmente por ora.
