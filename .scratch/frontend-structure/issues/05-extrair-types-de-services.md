# Extrair tipos de entidade dos services para types/

Type: task

Status: resolved

## Question

Os arquivos de `services/` hoje misturam formas de entidade/domínio com DTOs específicos de um único request/response. Extrair as formas de entidade/domínio pra `frontend/src/types/`, um arquivo por entidade, espelhando o nome do service correspondente. Regra: **forma de entidade/domínio → `types/`; DTO específico de um endpoint (request params, response envelope) → continua no arquivo do service.**

Classificação proposta (aplicar a regra acima; ajustar se algum tipo específico não se encaixar limpo):

- `frontend/src/types/essay.ts`: `EssayStatus`, `CompetencyId`, `CompetencyScore`, `EssayEvaluationScores`, `EssayHighlight`, `EssayEvaluation`, `Essay`, `EssayDetail` (de `essay-service.ts`)
  - ficam em `essay-service.ts`: `PresignedUpload`, `UploadEssayResponse`, `GetEssayDetailResponse`, `ListUserEssaysResponse`
- `frontend/src/types/theme.ts`: `Theme`, `ReferenceTextParagraph`, `ReferenceText`, `ThemeWithTopic` (de `theme-service.ts`)
  - ficam em `theme-service.ts`: `ListThemesParams`, `GetThemeResponse`
- `frontend/src/types/topic.ts`: `ThemeTopic` (de `topic-service.ts`)
- `frontend/src/types/user.ts`: `CurrentUser` (de `user-service.ts`)
- `frontend/src/types/auth.ts`: `AuthUser` (de `auth-service.ts`)
  - ficam em `auth-service.ts`: `AuthTokens` (formato de resposta da API de auth, não uma entidade), `SignUpInput`, `SignUpResponse`, `LoginInput`
- `credits-service.ts`: `RequestCreditsCheckoutResponse` fica onde está (DTO de um único endpoint, sem entidade de domínio associada)

Atualizar todos os imports que hoje pegam esses tipos direto do arquivo de service — são consumidos amplamente por páginas/componentes (`import type { Essay } from "../../services/essay-service"` etc. viram `import type { Essay } from "../../types/essay"`).

Se a ticket [CamelCase em arquivos e diretórios](04-camelcase-em-arquivos-e-diretorios.md) já tiver rodado, os arquivos de service já estarão renomeados (`essayService.ts` em vez de `essay-service.ts`) — ajuste os caminhos de import de acordo.

## Answer

Ticket 04 ainda não tinha rodado quando esta ticket foi resolvida — os arquivos de `services/` permanecem em `kebab-case` (`essay-service.ts` etc.), sem renomeação.

Criado `frontend/src/types/` com um arquivo por entidade, seguindo exatamente a classificação proposta, sem nenhuma reclassificação:

- `types/essay.ts`: `EssayStatus`, `Essay`, `CompetencyId`, `CompetencyScore`, `EssayEvaluationScores`, `EssayHighlight`, `EssayEvaluation`, `EssayDetail`.
- `types/theme.ts`: `Theme`, `ReferenceTextParagraph`, `ReferenceText`, `ThemeWithTopic` (importa `ThemeTopic` de `types/topic.ts`).
- `types/topic.ts`: `ThemeTopic`.
- `types/user.ts`: `CurrentUser`.
- `types/auth.ts`: `AuthUser`.

`essay-service.ts`, `theme-service.ts`, `topic-service.ts`, `user-service.ts` e `auth-service.ts` agora importam de volta os tipos que ainda usam internamente (`import type { ... } from "../types/essay"` etc.) — em `essay-service.ts` isso inclui as consts/funções que referenciam `EssayStatus`/`CompetencyId` (`REJECTION_REASON_LABELS`, `RESENDABLE_STATUSES`, `pendingResultHeading`, `COMPETENCY_COLORS`, etc.), que continuam no service porque não são formas de entidade. `credits-service.ts` ficou intocado.

Todos os imports que pegavam esses tipos direto dos arquivos de `services/*-service.ts` (11 arquivos consumidores: `EssayStatusHeader`, `EssayCard`, `PendingResult`, `CompetencyScores`, `CompetencyScoresSkeleton`, `CompetencyScoreCard`, `HighlightedEssayText`, `ThemeListItem`, `ThemeBadges`, `ThemeCard`, `AuthContext`) foram repontados pra `types/*`, mantendo em import separado o que ainda vem do service (funções/consts/objeto `xService`). Nenhum consumidor importava `AuthUser`, `Theme` (fora de `ThemeWithTopic`), `EssayDetail` ou `CompetencyScore` diretamente, então não houve mudança de import pra esses quatro tipos além do arquivo `types/` em si.

Nenhuma classificação divergiu do proposto na ticket — a divisão entidade-vs-DTO já estava limpa nos 5 services.

`cd frontend && npx tsc -b` limpo (sem erros, sem output).
