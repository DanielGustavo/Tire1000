# Preservar parágrafos na exibição da redação

Status: resolved

## O que fazer

Hoje o texto transcrito da redação (`textContent`, gerado na Revisão) não distingue quebra de parágrafo (estrutural, decidida pelo estudante) de quebra de linha (artefato da largura do papel) — não existe nenhuma convenção pra isso em nenhuma camada. Ver `docs/adr/0017-marcacao-de-paragrafo-fixada-na-origem-do-ocr.md` pra decisão completa e motivação.

Objetivo: a redação exibida na tela de Correção mostra cada parágrafo começando numa linha abaixo, com a primeira linha levemente recuada à direita — sem que quebras de linha do papel (que não são parágrafos) causem esse efeito.

### Backend — Revisão (OCR)

- `backend/src/domain/ai/validation/prompt.ts` (`VALIDATION_PROMPT`): estender a instrução de fidelidade existente (seção final do prompt, hoje só fala de ortografia/gramática/pontuação) pra também instruir o modelo a unir quebras de linha do papel em texto corrido, marcando **só** quebras de parágrafo reais com `\n\n`.
- Sem mudança de schema (`backend/src/domain/ai/validation/schema.ts`) — `textContent` continua `string | null`.

### Frontend — exibição

- `frontend/src/pages/essayResult/components/HighlightedEssayText.tsx`: hoje o texto é renderizado com `whitespace-pre-line` num único `<p>`, o que trata todo `\n` como quebra de linha visual. Trocar por uma lógica que:
  - Divide o texto em parágrafos por `\n\n`.
  - Qualquer `\n` avulso restante dentro de um parágrafo (resíduo de OCR imperfeito) é tratado como espaço, não como quebra — rede de segurança descrita no ADR 0017.
  - Cada parágrafo é um bloco com espaçamento acima e recuo (`text-indent`) só na primeira linha.
- **Atenção**: os highlights são posicionados por `anchorIndex`/`endIndex`, calculados via `text.indexOf` sobre o texto bruto completo (incluindo os `\n\n`) em `backend/src/infra/ai/gemini/utils/locate-highlight.ts`. Ao dividir o texto em parágrafos no frontend, os offsets de cada segmento de highlight precisam continuar corretos em relação à string original completa — não recalcular índices relativos a cada parágrafo isoladamente.

## Fora de escopo

- Backfill de redações já revisadas (ver ADR 0017) — vão continuar aparecendo como bloco único.
- Mudar o schema/contrato de `textContent` pra um array de parágrafos — decisão foi manter string única com `\n\n` como delimitador (ADR 0017).

## Testes

- Sem teste dedicado esperado pro prompt em si (mudança de texto livre, não lógica). Se a lógica de divisão de parágrafos/offsets de highlight no frontend tiver complexidade não trivial, considerar teste de componente — decisão de execução, não trava a ticket.

## Answer

Implementado como descrito, sem desvios:

- `backend/src/domain/ai/validation/prompt.ts`: adicionado um parágrafo à seção `# Instruções finais` já existente (nenhuma seção nova, nenhuma mudança de schema) instruindo o modelo a unir quebras de linha do papel em texto corrido e marcar só quebras de parágrafo reais com `\n\n`.
- `frontend/.../HighlightedEssayText.tsx`: `buildHighlightedTextSegments` (renomeado o tipo de retorno pra `RawSegment`, sem `key`) continua fatiando o texto bruto pelos `anchorIndex`/`endIndex` originais — isso não mudou. Nova função `buildParagraphs` agrupa esses segments já corretamente fatiados em parágrafos, dividindo por `/\n{2,}/` *depois* da fatia por highlight (nunca refatiando o texto por parágrafo), então os offsets continuam corretos mesmo quando um highlight cai perto de uma quebra de parágrafo. Qualquer `\n` avulso restante dentro de um parágrafo vira espaço (`replace(/\n/g, " ")`), troca de mesmo tamanho que não desloca offset nenhum. Cada parágrafo agora é um `<p>` próprio dentro de um `<div className="space-y-4">`, com `indent-8` (recuo só na primeira linha via `text-indent` do CSS).
- Edge case identificado e aceito (não coberto pela ticket): se o próprio trecho de um highlight contiver uma quebra de parágrafo (ex.: uma citação da IA que atravessa `\n\n`), ele é dividido em dois fragmentos `<mark>` independentes — um por parágrafo, cada um com seu próprio popup — em vez de permanecer uma única unidade interativa. Os offsets continuam corretos; só a interatividade fica fragmentada nesse caso raro.
- Sem teste dedicado adicionado — nem para o prompt (texto livre, conforme previsto) nem para a lógica de parágrafos do frontend: decisão de execução, dado que este repo não tem nenhuma infraestrutura de teste de frontend configurada ainda (sem vitest/testing-library instalados), então adicionar um teste de componente exigiria introduzir tooling novo, fora do escopo desta ticket.
- Verificado com `tsc --noEmit` (backend e frontend) limpo, suite completa do backend (181/181) e a lógica de agrupamento em parágrafos conferida manualmente com casos de borda (parágrafos múltiplos, `\n` avulso, quebras de parágrafo líder/final, highlight atravessando uma quebra de parágrafo).
- **Não verificado em navegador com backend real**: este repo não tem DynamoDB local nem mock do backend pro frontend, e o Serverless só roda por comando do usuário — a verificação ficou na lógica pura (casos de borda testados manualmente via script) e nos testes automatizados, não numa sessão real no app.
