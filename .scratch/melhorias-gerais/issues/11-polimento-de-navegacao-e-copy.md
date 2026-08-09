# Polimento solto: rodapé, logo, redirect de envio, copy dos avisos

Status: ready-for-agent

Itens pequenos e sem ambiguidade — não passaram por grilling dedicado, só confirmados como escopo na sessão.

## Escopo

- **Rodapé sempre no fundo da página**: `AppLayout` (`frontend/src/layouts/AppLayout.tsx:101-106`) e o `Footer` da landing (`frontend/src/pages/landing/components/Footer.tsx`) não têm `min-h-screen`/`flex-1` — em telas com pouco conteúdo o rodapé fica no meio da viewport em vez de grudado no fundo. Aplicar o padrão `min-h-screen flex flex-col` no wrapper + `flex-1` no conteúdo, nos dois layouts.
- **Logo do header linka pra home**: hoje é só uma `<img>` sem `<Link>` (`AppLayout.tsx:18`). Envolver em `<Link to="/">`.
- **Envio de redação redireciona pra tela da redação**: `handleUploadDone` (`useThemeDetailPage.ts:39`) hoje navega pra `/` no sucesso; trocar pra `navigate(`/essays/${essayId}`)` — a resposta do upload já inclui `essayId` (`essay-service.ts:9-12`).
- **Copy dos avisos acima do card de redação**: `STATUS_MESSAGES` (`EssayStatusHeader.tsx:5-14`) reescrito com tom mais amigável, mantendo sucinto — mesmas 8 chaves de status, só o texto muda.

## Referências

- `frontend/src/layouts/AppLayout.tsx:18,101-106`
- `frontend/src/pages/landing/components/Footer.tsx`
- `frontend/src/pages/themes/useThemeDetailPage.ts:39`
- `frontend/src/services/essay-service.ts:9-12`
- `frontend/src/pages/home/components/EssayStatusHeader.tsx:5-14`

## Comments

Implementado em `67d1e6a`. Rodapé grudado no fundo via `min-h-screen flex flex-col` no wrapper + `flex-1` no conteúdo, em `AppLayout.tsx` e `landing.tsx`. Logo do header envolvida em `<Link to="/">`. `handleUploadDone` passou a receber `essayId` e navegar pra `/essays/${essayId}` — precisou tipar `onDone` de `useEssayUploadFlow.ts` pra repassar o `essayId` do upload (capturado via ref dentro do hook), mantendo compatibilidade com a prop `onDone: () => void` de `EssayUploadFlow.tsx`/`theme-detail.tsx` (não tocados). `STATUS_MESSAGES` reescrito com tom mais amigável, mesmas 8 chaves. `tsc -b`/`oxlint` limpos.
