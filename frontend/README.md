# Frontend

React + Vite + TypeScript, Tailwind CSS, React Router, React Query, Axios. Mobile-first. See `../CONTEXT.md` for domain vocabulary.

Package manager: pnpm (`pnpm install`, `pnpm dev`, `pnpm build`).

## Folder convention

```
src/
  pages/      One folder per route (e.g. `pages/home/home.tsx` exporting `HomePage`), wired in `App.tsx`.
  layouts/    Route-wrapping layouts shared across pages (e.g. `AppLayout.tsx`), applied via nested
                React Router routes rendering `<Outlet/>`.
  components/ Shared/reusable UI used by more than one page (e.g. `Button`, `Modal`, `Field`).
  libs/       Thin wrappers around third-party libraries/browser APIs: the Axios instance (`axios.ts`) and
                token storage (`auth.ts`), grouped by concern as they're added.
  services/   One class per backend resource (e.g. `auth-service.ts` exporting an `AuthService` instance),
                extending the abstract `Service` base (`service.ts`), which holds the shared Axios client.
  App.tsx      Route definitions.
  main.tsx     App bootstrap: QueryClientProvider, BrowserRouter.
```

`home`, `landing`, and `themes` already follow this convention; the remaining pages (`theme-detail`,
`essay-upload`, `essay-result`, `credits`) are flat files still and get migrated opportunistically, not as
a standalone retrofit task.

### Page structure

- Each route gets its own folder: `pages/<page-name>/<page-name>.tsx` is the entry file exporting the
  `*Page` component (e.g. `pages/home/home.tsx` exports `HomePage`). No `index.tsx`/`page.tsx` — repeating
  the page name avoids ambiguous editor tabs.
- Every named subcomponent always gets its own file, under `pages/<page-name>/components/` (e.g.
  `pages/home/components/ThemeCard.tsx`). Don't define multiple components in the page's entry file.
- A component only moves out to the shared `src/components/` once a *second* page needs it. Until then it
  stays scoped to the page that owns it.
- Non-trivial state/coordination logic (anything beyond a couple of `useState`/`useQuery` lines) is
  extracted into a custom hook, co-located next to the component that uses it — no separate `hooks/`
  folder. Name it `useThing.ts` sitting beside `Thing.tsx`.
- Related routes (e.g. a list + detail pair) each get their own top-level page folder — don't nest one
  under the other or group them under a shared "resource" folder.
- Frontend test conventions (where hook/component tests live) are not decided yet — out of scope until
  frontend testing is set up.

## Conventions

- `httpClient` (`src/libs/axios.ts`) is the single Axios instance for backend calls; `baseURL` comes from `VITE_API_URL`, and it attaches the stored access token to every request.
- Token storage is abstracted behind `src/libs/auth.ts` (`getAccessToken`/`setAccessToken`) — pages never touch `localStorage` directly.
- Backend calls go through a `Service` subclass, not ad-hoc Axios calls in pages/components. See `src/services/auth-service.ts` for the reference example.
- Server state (API data) is fetched via React Query hooks, not `useEffect` + `useState`.
- Routes are added to `src/App.tsx` as pages land. Authenticated pages are nested under the `AppLayout`
  route so they get the shared header/footer for free.

## Environment

- Copy `.env.example` to `.env` and adjust as needed.
- `VITE_API_URL` — backend API base URL. Defaults to `http://localhost:3000` when unset.
