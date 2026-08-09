# `Select` não força o teclado a abrir em dispositivos touch

Status: ready-for-agent

## Contexto

`Select.tsx:79-81` chama `.focus()` no input de busca toda vez que o dropdown abre, em qualquer dispositivo:

```ts
useEffect(() => {
  if (open) searchInputRef.current?.focus();
}, [open]);
```

Em mobile isso abre o teclado virtual assim que a lista de opções abre — experiência ruim. Em desktop, esse mesmo autofoco é útil (digitar pra filtrar imediatamente, e a navegação por seta/`Enter` depende do input estar focado, via `handleKeyDown` no próprio input).

## Escopo

- Manter o `.focus()` automático em dispositivos com teclado físico.
- Suprimir o `.focus()` automático em dispositivos touch — detectar via `matchMedia("(pointer: coarse)")`.
- Navegação por teclado (seta/`Enter`) continua funcionando normalmente em desktop, sem mudança.

## Referências

- `frontend/src/components/Select.tsx:79-81`
- Usado (entre outros) pelo `Select` de eixo em `frontend/src/pages/themes/components/ThemesFilterModal.tsx:28`

## Comments

Implementado em `b82e1d8`. O `.focus()` automático do input de busca agora é condicionado a `!matchMedia("(pointer: coarse)").matches`; navegação por teclado em desktop (`handleKeyDown`) não foi tocada. `tsc -b`/`oxlint` limpos.
