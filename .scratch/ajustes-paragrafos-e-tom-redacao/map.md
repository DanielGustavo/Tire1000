# Ajustes de parágrafos e tom nos textos da Avaliação

## Destination

Três ajustes independentes na exibição da redação e nos textos gerados pela Avaliação, decididos numa sessão de grilling (ver `CONTEXT.md`, termos "Parágrafo"/"Parecer"/"Parecer geral", e os ADRs 0016/0017):

1. A redação exibida ao estudante preserva a estrutura de parágrafos do texto original — cada parágrafo começa numa linha nova, com recuo na primeira linha; quebras de linha do papel (sem significado semântico) não geram quebra visual.
2. O parecer geral (score `final` da Avaliação) passa a ser sintetizado por uma chamada de IA dedicada, em vez de concatenar os 5 pareceres de competência.
3. Os textos de parecer (5 competências) e de destaque ganham um tom mais direto e coloquial, falando diretamente com o estudante; o popup de destaque cresce um pouco pra acomodar textos mais longos.

Destino alcançado quando as 3 mudanças acima estiverem implementadas e mergeadas.

## Notes

- Decisões completas já registradas: `CONTEXT.md` (termos Parágrafo, Parecer, Parecer geral) e `docs/adr/0016-parecer-geral-sintetizado-por-ia-em-vez-de-concatenado.md` / `docs/adr/0017-marcacao-de-paragrafo-fixada-na-origem-do-ocr.md`. As 3 tickets abaixo já saem com `Status: ready-for-agent` — a fase de grilling já aconteceu na sessão que gerou este mapa; só reabrir se a implementação encontrar ambiguidade não coberta por elas.
- **Exceção às normas padrão do Wayfinder**: este mapa carrega execução, não só decisão — mesmo padrão do mapa [Frontend do zero a partir do Figma](../frontend-redesign/map.md) e do mapa [Ajustes de backend em temas e redações](../ajustes-backend-temas-redacoes/map.md). Cada ticket entrega código mergeado.
- Convenção de teste deste repo (`CLAUDE.md`): testes vivem na camada de application (use-cases/controllers) — pular teste dedicado de `domain/`/`infra/` a menos que a lógica seja genuinamente não-trivial.
- Prompts de IA seguem o esqueleto padrão do projeto (`# Papel e Objetivo` / `# Instruções` / `# Instruções finais`) — ver skill `ai-prompts`.
- Sem backfill: redações já revisadas/avaliadas antes dessas mudanças não são reprocessadas (ADR 0017; vale também pra ticket 02 — parecer geral de Avaliações já feitas continua sendo o texto concatenado antigo, já persistido).
- Nenhuma mudança de env var ou rota de API é esperada nessas 3 tickets — não deve ser necessário atualizar `.env.example`/`insomnia.json`.

## Decisions so far

(decisões já registradas nos ADRs/CONTEXT.md linkados acima, não duplicadas aqui — ver Notes)

- [Preservar parágrafos na exibição da redação](issues/01-preservar-paragrafos-na-exibicao-da-redacao.md) — prompt de Revisão instruído a marcar só quebras de parágrafo reais com `\n\n`; `HighlightedEssayText.tsx` agrupa os segments de highlight (já fatiados pelo texto bruto) em parágrafos, sem refatiar offsets. Edge case aceito: highlight que atravessa uma quebra de parágrafo vira dois fragmentos interativos separados.

## Not yet specified

(nenhuma — as 3 tickets cobrem o destino integralmente)

## Out of scope

- Backfill/reprocessamento de redações já revisadas ou avaliadas (ADR 0017).
- Qualquer outro ajuste de tom além dos textos de parecer e destaque (ex.: mensagens de erro, copy estática do produto).
- Mudar o schema/contrato de `textContent` pra um array de parágrafos — decisão foi manter string única com `\n\n` como delimitador (ADR 0017).
