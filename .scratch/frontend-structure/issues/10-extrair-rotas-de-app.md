# Extrair rotas de App.tsx pra src/routes.tsx

Type: task

Status: resolved

## Question

`frontend/src/App.tsx` hoje mistura a composição raiz do app (`AuthProvider`, `Toaster`) com a definição dos guards de rota (`RootRoute`, `RequireAuth`) e a árvore inteira de `<Routes>`.

Extrair pra `frontend/src/routes.tsx`:
- `RootRoute` (alterna `HomePage`/`LandingPage` conforme `isAuthenticated`)
- `RequireAuth` (guard que redireciona pra `/` se não autenticado)
- A árvore `<Routes>...</Routes>` completa (rota raiz, `/themes`, `/themes/:themeId`, `/essays/:essayId`, `/credits` — ajustar se a ticket [Remover página de créditos não utilizada](01-remover-pagina-creditos.md) já tiver rodado e essa rota não existir mais)

Exportar um componente (`AppRoutes`, default export) que `App.tsx` renderiza. `App.tsx` fica só com:
```tsx
function App() {
  return (
    <AuthProvider>
      <Toaster />
      <AppRoutes />
    </AuthProvider>
  );
}
```

## Answer

Criado `frontend/src/routes.tsx` com `RootRoute`, `RequireAuth` e um novo componente `AppRoutes` (default export) contendo a árvore `<Routes>...</Routes>` exatamente como estava em `App.tsx` (rota raiz, `/themes`, `/themes/:themeId`, `/essays/:essayId` — sem `/credits`, já removida pela ticket 01). Levados junto os imports que só `routes.tsx` usa: `Navigate`/`Outlet`/`Route`/`Routes` do `react-router-dom`, `useAuth`, `Loading`, `AppLayout` e as 5 páginas (`EssayResultPage`, `HomePage`, `LandingPage`, `ThemesPage`, `ThemeDetailPage`).

`frontend/src/App.tsx` reduzido para só `AuthProvider` + `Toaster` + `AppRoutes`, mantendo `AuthProvider` (de `./contexts/AuthContext`) e `Toaster` (de `./components/Toaster`) como únicos imports.

`npx tsc -b` limpo depois da extração.
