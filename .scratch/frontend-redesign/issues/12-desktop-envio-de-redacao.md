# Envio de redação: upload de arquivo (desktop)

Type: prototype

Blocked by: 06

Status: resolved

## Question

Construir o fluxo de envio de redação para desktop, entrando direto pelo **upload tips modal** (nó `148:2647`, já construído na ticket "Envio de redação: câmera (mobile) + confirmação (mobile)") em vez do caminho de câmera — desktop não tem (nem faz sentido ter) os modais de permissão de câmera/captura nativa que o mobile tem. Reaproveitar os modais de confirmação/loading/erro já construídos na ticket mobile, adaptando o layout pro breakpoint desktop (não há frames de desktop dedicados para eles no Figma — confirmar com screenshot se é só uma versão centralizada/menor do modal mobile).

## Answer

**Nenhuma mudança de código foi necessária** — o fluxo de upload desktop já funcionava corretamente com o código existente, ponto por ponto:

1. **Entrada direto pelo upload tips modal, sem caminho de câmera**: já era o comportamento de `mode="upload"` desde a ticket 06. `EssayUploadFlow.tsx` só chama `handleOpenCamera` (que dispara `checkCameraPermission`/`requestCameraPermissionGate` e os steps `permission-revoked`/`permission-accepted`) quando `mode === "camera"`; pra `mode === "upload"` o clique vai direto de `TipsModal` pra `handleOpenFilePicker`, sem nunca tocar `CameraPermissionModal`. Ou seja, a máquina de estados de `useEssayCaptureFlow.ts` já implementa exatamente a exigência da ticket — desktop (via CTA "Fazer upload") nunca alcança os modais de permissão de câmera.

2. **Reaproveitar confirmação/loading/erro, layout adaptado pro desktop**: confirmado via screenshot que é **só uma versão centralizada do modal mobile**, sem nenhuma adaptação de layout necessária. Evidência:
   - `get_metadata` no canvas `Desktop` (nó `106:1830`) não retorna nenhum frame de upload/confirmação/loading/erro — só `Correção`, `Tema`, `Temas`, `Homepage`, `LP - desktop` etc. Não existe frame desktop dedicado pra nenhum desses modais.
   - `get_screenshot` nos 4 nós do fluxo mobile (`148:2647` tips-upload, `148:2737` confirmation-upload, `148:2567` loading, `39:1015` error) devolve `original_width: 402` pros 3 últimos — são frames de tela inteira de celular só pra enquadrar o modal, não frames desktop.
   - `get_design_context` em `148:2647` mostra que o próprio modal já é implementado no Figma como uma caixa de **largura fixa `w-[377px]` centralizada via `translate(-50%,-50%)`** sobre um backdrop full-bleed — ou seja, o modal em si nunca foi desenhado pra esticar com a largura da tela, mobile ou desktop. Isso bate exatamente com `components/Modal.tsx` (`max-w-[377px]`, centralizado via flex, `fixed inset-0`), já confirmado zero-mudança pelas tickets 08–11.
   - Conteúdo de texto/ícones dos 4 modais (`TipsModal` variante upload, `PhotoConfirmationModal` variante upload, `PhotoConfirmationLoadingModal`, `PhotoConfirmationErrorModal`) conferido 1:1 contra os screenshots — sem divergência.

3. **CTA "Fazer upload" ainda dispara o fluxo em `lg:`**: verificado em `theme-detail.tsx` — `EssayUploadFlow` é renderizado como irmão de nível de página (`{uploadMode && uploadThemeId && <EssayUploadFlow ... />}`), fora da `div` do card de CTA que ganhou `lg:flex-row`/`lg:w-[295px]` na ticket 11. Como `Modal.tsx` usa `fixed inset-0`, o modal nunca fica preso ao fluxo de layout do card — a mudança de 2 colunas da ticket 11 não quebrou (nem poderia quebrar) o trigger.

**Questão em aberto, não decidida (sem usuário ao vivo pra grilling)**: o Figma desktop mantém os dois botões do card de CTA (`Tirar foto da redação` e `Fazer upload da redação`, nó `195:1882` — conferido via screenshot). Clicar em "Tirar foto" em desktop ainda passa pelo gate de permissão via `getUserMedia({video:true})` (herdado da ticket 06/mobile) — que em navegador desktop dispara um prompt real de permissão de webcam, sem relação com o real mecanismo de seleção de arquivo que segue depois (`<input type="file">` sem `capture`, já que o atributo `capture` é ignorado por navegadores desktop). Isso é semanticamente estranho em desktop (pedir permissão de câmera pra uma ação que na prática abre um seletor de arquivo), mas mudar esse comportamento é uma decisão de comportamento fora do escopo textual desta ticket (que fala especificamente da entrada via "Fazer upload") e tocaria lógica compartilhada com o mobile (`useEssayCaptureFlow.ts`) — não decidido, deixado como está (default = comportamento mobile existente), documentado aqui pra decisão futura.

QA manual em browser não foi possível (sem automação de browser disponível nesta sessão, mesma limitação das tickets 04/06/07/08–11) — validado só por `tsc -b`/`oxlint` limpos (ambos já estavam limpos antes desta ticket, nada mudou) e verificação cruzada com Figma (`get_metadata`/`get_screenshot`/`get_design_context`, escopados aos nós específicos do fluxo).
