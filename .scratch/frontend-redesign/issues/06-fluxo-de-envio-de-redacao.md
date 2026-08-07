# Envio de redação: câmera (mobile) + confirmação (mobile)

Type: prototype

Blocked by: 05

## Question

Construir o fluxo de captura/envio de foto da redação (mobile) a partir do Figma (seção "Fluxo de tema", nó `207:3676`, canvas Responsive `5:1551`), substituindo/completando `essay-upload.tsx`. É o fluxo com mais telas do mapa — modais em sequência:

- **Photo tips modal** (`148:2507`) — entrada pelo caminho câmera.
- **Camera permission revoked modal** (`148:2483`) / **Camera permission accepted modal** (`148:2493`).
- **Native camera** (`148:2588`) — captura em si.
- **Photo confirmation modal** (`148:2543` e `148:2737` — duas variantes, checar a diferença com `get_design_context`) — revisar a foto antes de enviar.
- **Photo confirmation loading modal** (`148:2567`) — aguardando o upload/Revisão.
- **Photo confirmation error modal** (`39:1015`) — erro no upload ou rejeição.
- **upload tips modal** (`148:2647`) — entrada alternativa pelo caminho de seleção de arquivo (sem câmera); o botão principal já usa o ícone `lucide/upload`, não `lucide/camera`. **Esta é também a tela de entrada do fluxo de desktop** (ticket 12) — vale construir de um jeito que já funcione com `<input type="file">` nativo, não só com a Camera API.

Mapeia pra `POST /essays`/`POST /essays/{essayId}` (upload direto pro S3 via presigned POST, ver spec) e pro polling/consulta de `GET /essays/{essayId}` enquanto o status é `UPLOADING`/`QUEUED`/`VALIDATING`. Fechar durante a resolução: fallback de permissão de câmera negada (retry? cair pro caminho de upload de arquivo?).
