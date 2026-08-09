# CTAs da página de tema fixos no fundo da viewport

Status: ready-for-agent

## Contexto

Os dois botões "Tirar foto da redação"/"Fazer upload da redação" (`frontend/src/pages/themes/theme-detail.tsx:85-104`) hoje só existem no fluxo normal do documento, no fim do conteúdo — o usuário precisa rolar até o fim da página pra vê-los.

## Escopo

- Aplicar `position: sticky; bottom: 0` no container que envolve os dois botões — gruda no fundo da viewport durante o scroll, e assenta na posição natural (fim do conteúdo) quando a página realmente termina. CSS puro, sem JS/`IntersectionObserver`.

## Referências

- `frontend/src/pages/themes/theme-detail.tsx:85-104`

## Comments

Implementado em `156081e`. Container dos 2 CTAs ganhou `sticky bottom-0 z-10` + `bg-neutral-0`/`border-t-2 border-neutral-900`/`py-2.5` (fundo sólido e separador pra não deixar o conteúdo por trás transparecer, seguindo a linguagem de borda dura já usada em `Modal`/`Field`/`Select`/`PaperCard` — não havia padrão de `sticky` prévio no repo pra reaproveitar). CSS puro, sem JS. `tsc -b`/`oxlint` limpos.
