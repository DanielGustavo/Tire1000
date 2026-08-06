# Frontend

React + Vite + TypeScript, Tailwind CSS, React Router, React Query, Axios. Mobile-first. See `../CONTEXT.md` for domain vocabulary.

Package manager: pnpm (`pnpm install`, `pnpm dev`, `pnpm build`).

## Folder convention

```
src/
  pages/      One file per route (e.g. `home.tsx` exporting `HomePage`), wired in `App.tsx`.
  libs/       Thin wrappers around third-party libraries/browser APIs: the Axios instance (`axios.ts`) and
                token storage (`auth.ts`), grouped by concern as they're added.
  services/   One class per backend resource (e.g. `auth-service.ts` exporting an `AuthService` instance),
                extending the abstract `Service` base (`service.ts`), which holds the shared Axios client.
  App.tsx      Route definitions.
  main.tsx     App bootstrap: QueryClientProvider, BrowserRouter.
```

## Conventions

- `httpClient` (`src/libs/axios.ts`) is the single Axios instance for backend calls; `baseURL` comes from `VITE_API_URL`, and it attaches the stored access token to every request.
- Token storage is abstracted behind `src/libs/auth.ts` (`getAccessToken`/`setAccessToken`) — pages never touch `localStorage` directly.
- Backend calls go through a `Service` subclass, not ad-hoc Axios calls in pages/components. See `src/services/auth-service.ts` for the reference example.
- Server state (API data) is fetched via React Query hooks, not `useEffect` + `useState`.
- Routes are added to `src/App.tsx` as pages land.

## Environment

- Copy `.env.example` to `.env` and adjust as needed.
- `VITE_API_URL` — backend API base URL. Defaults to `http://localhost:3000` when unset.
