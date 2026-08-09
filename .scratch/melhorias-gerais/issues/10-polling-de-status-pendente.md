# Polling de status pendente: correção relaxada pra 30s, Home ganha polling

Status: ready-for-agent

## Contexto

A tela de correção já faz polling (`useEssayResultPage.ts:14`, `refetchInterval` do React Query) mas a cada **2s** enquanto o status está pendente — agressivo pra um processo que tipicamente leva minutos. A Home (`useEssaysSection.ts`) lista as redações do usuário mas não faz nenhum polling — uma redação que muda de status (ex. termina de processar) só atualiza com um refresh manual da página.

## Escopo

- Relaxar o `refetchInterval` da tela de correção de 2s pra 30s.
- Adicionar polling de 30s na Home, mesmo idioma (`refetchInterval` condicional), disparando enquanto existir pelo menos uma redação com status em `PENDING_STATUSES`.

## Referências

- `frontend/src/pages/essay-result/useEssayResultPage.ts:14`
- `frontend/src/pages/home/components/useEssaysSection.ts`
- `frontend/src/services/essay-service.ts:98,107` (`PENDING_STATUSES`, `BLOCKED_ESSAY_RESULT_STATUSES`)
