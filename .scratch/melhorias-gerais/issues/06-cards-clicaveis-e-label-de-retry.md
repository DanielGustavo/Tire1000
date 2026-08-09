# `EssayCard`/`ThemeCard` como link real + label de retry corrigido

Status: ready-for-agent

## Contexto

Hoje só o botão/chevron final de `EssayCard` (`frontend/src/pages/home/components/EssayCard.tsx`) e `ThemeCard` (`frontend/src/pages/home/components/ThemeCard.tsx`) são clicáveis (`<Link>`) — o resto do card é um `<div>` sem `onClick`. `onClick`+`navigate()` não dá semântica de link nativa (sem clique do meio abrindo em nova aba). Separadamente: durante `status === "UPLOADING"`, `EssayCard` já suprime o resend inline, mas mostra um botão ainda rotulado "Tentar novamente" que na verdade só linka pra `/essays/:id` (`EssayCard.tsx:59-63`) — não é um retry de verdade, o label é enganoso.

## Escopo

- **Card como link**: envolver o card inteiro num `<Link>` real ("stretched link" — `<Link>` cobrindo o card, botão interno por cima com `stopPropagation`), pra suportar clique do meio/ctrl-clique nativamente.
- **`EssayCard`** — regras por status:
  - Status com resend inline (`inlineResend`, hoje `REJECTED`/`UPLOAD_FAILED`/`VALIDATION_FAILED`): card **não clicável** — só o botão "Tentar novamente" é interativo.
  - `EVALUATION_FAILED`: card **não clicável**, sem link (mantém sem action row).
  - Demais status (`SUCCESS`, `UPLOADING`, status "chevron" genéricos): card inteiro linka pra `/essays/:id`.
- **`ThemeCard`**: card inteiro linka pra `/themes/:id` (sem sub-casos, não tem controle interno concorrente).
- **Label do botão durante `UPLOADING`**: trocar "Tentar novamente" por algo que reflita a ação real (o botão leva pra tela da redação, não reenvia nada) — ex. "Acompanhar envio" ou "Ver redação".

## Referências

- `frontend/src/pages/home/components/EssayCard.tsx:17,41,53-68`
- `frontend/src/pages/home/components/ThemeCard.tsx`
- `frontend/src/services/essay-service.ts:84` (`RESENDABLE_STATUSES`)

## Comments

Implementado em `30ef59c`. `EssayCard`/`ThemeCard` viram stretched link (`<Link>` cobrindo o card via posicionamento absoluto sobre o wrapper `relative` do `TexturedCard`) pros status sem controle concorrente (`SUCCESS`/chevron genéricos em `EssayCard`, todo `ThemeCard`); `inlineResend` e `EVALUATION_FAILED` continuam sem link no card. Os botões/chevrons visuais que apontavam pro mesmo destino do link do card viraram decorativos (`tabIndex={-1} aria-hidden`) em vez de um segundo `<Link>` aninhado. Label de `UPLOADING` trocado de "Tentar novamente" pra "Acompanhar envio". `tsc -b`/`oxlint` limpos.
