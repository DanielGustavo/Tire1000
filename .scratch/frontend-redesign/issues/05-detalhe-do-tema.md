# Detalhe do tema, com e sem crédito (mobile)

Type: prototype

Blocked by: 01

Status: resolved

## Question

Construir a tela de detalhe do tema (mobile) a partir do Figma, substituindo `theme-detail.tsx`:

- Frame "Tema" com crédito disponível (seção "Fluxo de tema", nó `207:3552` ou `148:2313` — checar qual é a versão final/mais recente do frame, os dois têm o mesmo nome): título, eixo, textos motivadores (texto e imagem, com fonte/citação — ver `CONTEXT.md`), CTA pra iniciar envio de redação.
- Frame "Tema" variante sem crédito (seção "Fluxo de tema - sem crédito", nó `207:3677`): mesma tela, mas o CTA leva para o price modal + stripe (compra de crédito) em vez de iniciar o envio.

O ponto de entrada do fluxo de envio de redação (câmera/upload) fica coberto pela ticket "Envio de redação" — aqui só o CTA que dispara esse fluxo, não os modais de captura em si.

## Answer

Ver gist em [map.md](../map.md#decisions-so-far), entrada "05-detalhe-do-tema". Resumo: `frontend/src/pages/themes/theme-detail.tsx` reescrito; frame com/sem crédito é a mesma tela, diferindo só no destino do CTA (fluxo de envio se `credits > 0`, `PriceModal` caso contrário). Fechado via `/grilling` um gap de backend descoberto na implementação: não existia mecanismo pra transformar o `fileKey` de uma imagem de Texto motivador numa URL exibível. Decisão do usuário: bucket S3 privado + CloudFront (não bucket público), com a URL montada no DTO do backend (`toReferenceTextDTO`), não no frontend. Infra nova em `backend/sls/resources/theme-assets.yml`; deploy real e upload do asset de seed ficam manuais (mesmo padrão de cadastro de tema).
