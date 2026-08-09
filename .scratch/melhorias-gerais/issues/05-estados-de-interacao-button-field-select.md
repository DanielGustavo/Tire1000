# Estados de interação em `Button`, `Field` e `Select`

Status: ready-for-agent

## Contexto

`Button` (`frontend/src/components/Button.tsx`) não tem hover/active/focus-visible — variantes são só cor/borda/sombra estáticas; `disabled` funciona via atributo nativo mas sem estilo (fica visualmente idêntico a habilitado); não existe prop `loading`. `Field` (`frontend/src/components/Field.tsx`) só tem `error`/`success`; foco no `<input>` é `outline-none` sem substituto; sem hover/disabled/loading estilizados. `Select` (`frontend/src/components/Select.tsx`) nem tem `error`/`loading`/`disabled` no tipo — só o highlight de hover nas opções da lista.

## Escopo

- **`Button`**: hover/active/focus-visible consistentes com o estilo "hard shadow" já usado no design system; `disabled` ganha estilo visualmente esmaecido; nova prop `loading` que bloqueia clique (funcionalmente igual a `disabled`) mas **não** parece desabilitado visualmente — mostra o ícone `Loader` + `animate-spin` já usado em `PhotoConfirmationLoadingModal.tsx:11`, ao lado ou no lugar do label. Os dois lugares que hoje trocam o texto do botão manualmente pra indicar loading (`credits.tsx:96`, `SignInModal.tsx:63`) migram pra essa prop.
- **`Field`**: hover, foco visível (substituindo o `outline-none` sem nada no lugar), `disabled` esmaecido. `error` já funciona, manter.
- **`Select`**: adicionar `error`/`disabled`/`loading` ao tipo e estilizar; hover/foco consistentes com `Field`. `loading` usado concretamente no `Select` de eixo do `ThemesFilterModal` enquanto `topicsQuery` está pendente (`ThemesFilterModal.tsx:18`) — hoje o select fica vazio sem nenhuma indicação.

## Referências

- `frontend/src/components/Button.tsx`
- `frontend/src/components/Field.tsx:48` (`outline-none` sem substituto)
- `frontend/src/components/Select.tsx:7-13` (tipo sem `error`/`loading`/`disabled`)
- `frontend/src/pages/essay-upload/components/PhotoConfirmationLoadingModal.tsx:11`
- `frontend/src/pages/themes/components/ThemesFilterModal.tsx:18`
