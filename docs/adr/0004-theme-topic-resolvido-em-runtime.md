# Theme resolve o eixo (ThemeTopic) com uma query separada, sem denormalizar nem entrar no GSI2

O GSI2 continua como já era: `Theme` e `ReferenceText` compartilham `GSI2PK = THEME#<themeId>`, então uma única Query nesse índice retorna o tema e seus textos motivadores juntos.

Cheguei a considerar colocar `ThemeTopic` nesse mesmo GSI2, pra trazer o eixo (título/cor) na mesma query. Não dá: um `ThemeTopic` é reaproveitado por vários `Theme`s (o mesmo eixo "Educação", por exemplo, aparece em dezenas de temas), então o item dele não tem como carregar um `GSI2PK = THEME#<themeId>` fixo sem duplicar o `ThemeTopic` por tema — o que reintroduz o mesmo problema de duplicação/staleness que a denormalização de `topicTitle`/`topicColor` direto no Theme já tinha (tentativa descartada antes de commitar).

Em vez disso, o eixo é resolvido com uma leitura separada, sem armazenar cópia:

- `GET /themes/{themeId}` — depois da Query em GSI2 (Theme + ReferenceTexts), um `GetItem` no `ThemeTopic` pelo `topicId` traz título/cor.
- `GET /themes` — depois de listar os Themes da página, um único `BatchGetItem` busca os `ThemeTopic`s de todos os `topicId` distintos do resultado (em vez de N `GetItem`s ou de denormalizar).
