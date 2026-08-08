# 03 — Seed: reescrita completa em Markdown (13 anos do ENEM)

**What to build:** o conteúdo de texto motivador de cada um dos 13 arquivos de seed é editado para que sua estrutura original (títulos de capítulo, subtítulos, artigos/enumerações) fique representada em Markdown, e a chave `title` (agora não usada) é removida de cada entrada.

**Blocked by:** 02 — Seed: script deriva `order` da posição no array

**Status:** ready-for-agent

- [x] Chave `title` removida de toda entrada de texto motivador nos 13 arquivos `enem-*.json`.
- [x] Leitura completa dos 13 arquivos (não só os casos já identificados); strings com cara de título/subtítulo/estrutura convertidas para Markdown (`##`/`###` para títulos/subtítulos, listas para enumerações como artigos de lei); `#`/heading de nível 1 não é usado.
- [x] Conteúdo que já é prosa simples permanece como prosa simples (sem markdown desnecessário).

## Comments

Implementado em `8923765`. Nota: o diretório tem na verdade 14 arquivos (2012–2025), não 13 — todos os 14 foram lidos e tiveram `title` removido. 7 arquivos (2012, 2013, 2016, 2017, 2022, 2023, 2024) ganharam formatação Markdown real (headings, listas, negrito em cláusulas legais avulsas); os demais (2014, 2015, 2018, 2019, 2020, 2021, 2025) já eram prosa simples e foram deixados como estavam. Todos os arquivos validados como JSON válido após a edição.
