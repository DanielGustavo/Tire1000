# Extrair useUploadEssay/useResendEssay como hooks/mutations/

Type: task

Blocked by: 02, 03, 07

Status: open

## Question

Hoje `pages/themes/components/useEssayUploadFlow.ts` e `pages/home/components/useEssayResendFlow.ts` chamam `essayService.upload`/`essayService.uploadPhoto`/`essayService.resend` direto dentro do `onSubmit` que passam pro `useEssayCaptureFlow` (em `flows/essayCapture/hooks/useEssayCaptureFlow.ts`, após a ticket 02) — misturando a chamada crua ao service com a orquestração do fluxo de step machine.

Extrair pra hooks de mutation nomeados:

- `frontend/src/hooks/mutations/useUploadEssay.ts` — envolve `essayService.upload(themeId)` seguido de `essayService.uploadPhoto(upload, photo)` como uma mutation só, retornando `{ essayId }`. Expõe a ação como `uploadEssay`/`uploadEssayAsync` (não `mutate` genérico).
- `frontend/src/hooks/mutations/useResendEssay.ts` — envolve `essayService.resend(essayId)` seguido de `essayService.uploadPhoto(upload, photo)`. Expõe `resendEssay`/`resendEssayAsync`.

Depois de resolvida a ticket [Extrair hooks colocalizados em components/ para hooks/ de cada página](03-extrair-hooks-de-components.md), os consumidores ficam em:
- `pages/themes/hooks/useEssayUploadFlow.ts` — passa a chamar `uploadEssayAsync` de `useUploadEssay()` dentro do `onSubmit` que repassa ao `useEssayCaptureFlow`, mantendo o tratamento de erro/toast (`applyFieldErrors`) e o `onSuccess` (`onDone(essayId)`) como estão hoje.
- `pages/home/hooks/useEssayResendFlow.ts` — mesma ideia com `resendEssayAsync` de `useResendEssay()`, mantendo a invalidação de `["essays"]` e `onDone()` no `onSuccess`.

`useEssayCaptureFlow` (o step-machine genérico de `mode`/`onSubmit`/`onSuccess`) **não muda** — ele continua agnóstico de qual mutation está por trás do `onSubmit` que recebe.
