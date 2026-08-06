# Frontend

React + Vite + TypeScript, Tailwind CSS, React Router, React Query, Axios. Mobile-first. See `../CONTEXT.md` for domain vocabulary.

Package manager: pnpm (`pnpm install`, `pnpm dev`, `pnpm build`).

## Folder convention

```
src/
  pages/     One file per route (e.g. `home.tsx` exporting `HomePage`), wired in `App.tsx`.
  api/       Axios client instance and API call functions, grouped by resource as they're added.
  App.tsx     Route definitions.
  main.tsx    App bootstrap: QueryClientProvider, BrowserRouter.
```

## Conventions

- `apiClient` (`src/api/client.ts`) is the single Axios instance for backend calls; `baseURL` comes from `VITE_API_URL`.
- Server state (API data) is fetched via React Query hooks, not `useEffect` + `useState`.
- Routes are added to `src/App.tsx` as pages land.

## Environment

- `VITE_API_URL` — backend API base URL. Defaults to `http://localhost:3000` when unset.
