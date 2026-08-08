# 03 — Seed: reescrita completa em Markdown (13 anos do ENEM)

**What to build:** o conteúdo de texto motivador de cada um dos 13 arquivos de seed é editado para que sua estrutura original (títulos de capítulo, subtítulos, artigos/enumerações) fique representada em Markdown, e a chave `title` (agora não usada) é removida de cada entrada.

**Blocked by:** 02 — Seed: script deriva `order` da posição no array

**Status:** ready-for-agent

- [ ] Chave `title` removida de toda entrada de texto motivador nos 13 arquivos `enem-*.json`.
- [ ] Leitura completa dos 13 arquivos (não só os casos já identificados); strings com cara de título/subtítulo/estrutura convertidas para Markdown (`##`/`###` para títulos/subtítulos, listas para enumerações como artigos de lei); `#`/heading de nível 1 não é usado.
- [ ] Conteúdo que já é prosa simples permanece como prosa simples (sem markdown desnecessário).
