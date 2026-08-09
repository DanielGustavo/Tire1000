# Paginação/filtro de temas persistem na URL; voltar do detalhe usa histórico real

Status: ready-for-agent

## Contexto

`useThemesPage` (`frontend/src/pages/themes/useThemesPage.ts:8-10`) guarda `search`/`topicId`/`page` em `useState` local — some ao desmontar. Entrar num tema e voltar sempre reseta pra página 1, sem filtro. O "Voltar" da página de detalhe do tema é um `<Link to="/themes">` fixo (`theme-detail.tsx:40`), então sempre volta pra listagem de temas mesmo quando o usuário entrou a partir da Home.

## Escopo

- Mover `search`/`topicId`/`page` de `useThemesPage` pra query string da URL (`?page=&topicId=&search=`) — sobrevive a navegar pra fora e voltar, e a um refresh de página.
- Trocar o "Voltar" de `theme-detail.tsx:40` de `<Link to="/themes">` fixo pra `navigate(-1)` — histórico real do navegador, volta pra onde o usuário realmente veio (Home ou listagem de temas).
- Ao trocar de página na listagem de temas, rolar a tela pro topo.

## Referências

- `frontend/src/pages/themes/useThemesPage.ts:8-10,22`
- `frontend/src/pages/themes/theme-detail.tsx:40-43`
- `frontend/src/pages/themes/themes.tsx`

## Comments

Implementado em `3d40cc0`. `useThemesPage` migrou `search`/`topicId`/`page` pra `useSearchParams` (`?search=&topicId=&page=`, cada um omitido da URL quando vazio/default); shape de retorno do hook ficou igual, `themes.tsx` não precisou de mudança. Trocar `search`/`topicId` reseta `page` removendo o param (mesmo comportamento de reset pra página 1 de antes). "Voltar" de `theme-detail.tsx` virou `navigate(-1)` (histórico real). `setPage` agora também rola pro topo. `tsc -b`/`oxlint` limpos.
