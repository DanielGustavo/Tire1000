# Extrair rotas de App.tsx pra src/routes.tsx

Type: task

Status: open

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
