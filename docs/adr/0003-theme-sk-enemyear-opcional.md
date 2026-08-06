# SK de Theme combina enemYear (quando existir) ou createdAt; enemYear é opcional

A SK do item Theme (partição fixa `PK = THEMES`) é composta para permitir ordenação cronológica dentro da partição. Quando o tema tem `enemYear` (foi baseado numa prova real do ENEM), a SK usa `THEME#<enemYear>#<themeId>`, com `enemYear` no formato `YYYY-01-01`. Quando não tem (tema próprio, não vinculado a uma prova publicada), a SK usa `THEME#<createdAt>#<themeId>`, com `createdAt` no formato `YYYY-MM-DD`. `enemYear` é portanto um atributo **opcional** em Theme, não obrigatório.

Trade-off aceito: a listagem "ordenada por data de publicação" mistura duas semânticas de data (ano da prova vs. data de criação) na mesma ordenação — isso é intencional, já que temas vinculados a provas passadas devem naturalmente aparecer mais antigos na lista.
