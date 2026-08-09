# Extrair tipos de entidade dos services para types/

Type: task

Status: open

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
