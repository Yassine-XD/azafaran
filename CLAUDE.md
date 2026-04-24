# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

Azafaran is a halal-meat-delivery platform organised as a monorepo of four independently-deployed apps plus the prod deployment stack. Each app has its own `package.json` — there is no root-level workspace manager, so install deps inside each subfolder.

| Folder     | Stack                                                    | Role                                                 |
|------------|----------------------------------------------------------|------------------------------------------------------|
| `backend/` | Node 20 · Express 5 · TypeScript · PostgreSQL · Jest     | REST API (`/api/v1`), cron jobs, Stripe, SMTP       |
| `frontend/`| Expo 54 · React Native 0.81 · expo-router · NativeWind    | Customer mobile/web app (iOS, Android, web)         |
| `admin/`   | Vite 6 · React 19 · react-router · Tailwind 4             | Admin dashboard SPA served at `/admin/`             |
| `landing/` | Vite 6 · `vite-react-ssg` · React 19 · Tailwind 4         | Marketing site, SSG to static HTML, served at `/`   |
| `deploy/`  | docker-compose · nginx · certbot                          | Prod stack (see `deploy/README.md`)                 |

Single nginx in front routes: `/` → landing static, `/admin/` → admin static, `/api/` → backend container, `/uploads/` → backend static files.

## Commands

### Backend (`backend/`)
```bash
npm install
npm run dev                 # ts-node-dev on src/server.ts
npm run build               # tsc → dist/
npm start                   # node dist/server.js
npm test                    # jest --forceExit --detectOpenHandles
npm test -- src/tests/products.test.ts           # run a single test file
npm test -- -t "name"                            # run tests by title
npm run test:watch
npm run test:coverage
npm run migrate:up          # node-pg-migrate up (SQL migrations)
npm run migrate:down
npm run migrate:status
docker compose up -d        # local Postgres 15 (port 5432, user postgres / password)
```
Tests require a reachable `DATABASE_URL` (see `.env.example`). `jest.config.ts` pins `testMatch` to `src/tests/**/*.test.ts` and loads `src/tests/setup.ts` which just calls `dotenv.config()`.

### Frontend (`frontend/`)
```bash
npm install
npm start                   # expo start
npm run android | ios | web
npm run lint                # expo lint (eslint-config-expo)
```
Public env vars must be prefixed `EXPO_PUBLIC_` — see `.env.example`. API host defaults to `https://www.azafaran.es` when unset.

### Admin (`admin/`)
```bash
npm install
npm run dev                 # vite (http://localhost:5173)
npm run build               # tsc -b && vite build → dist/
npm run preview
```
Public env vars must be prefixed `VITE_` — see `.env.example`.

### Landing (`landing/`)
```bash
npm install
npm run dev
npm run build               # SSG: tsc -b --noEmit && vite-react-ssg build && node scripts/post-build.mjs
npm run typecheck
```

## Backend architecture

Request flow: `server.ts` → `app.ts` (helmet + global rate-limit + JSON parser that **skips** the Stripe webhook path for raw-body verification) → `src/routes/index.ts` → feature routes → controllers → services → repositories → `pg` pool.

- **Layering is strict.** Controllers do request/response + `zod` validation (schemas in `src/validators/`). Services own business logic. Repositories own SQL — no SQL belongs in services or controllers.
- **Env validation is fail-fast.** `src/config/env.ts` parses `process.env` with zod; missing/short secrets crash the process on boot. When adding a new env var, register it there.
- **Auth** uses short-lived JWT access tokens + refresh-token family tracking (see migration `028_refresh-token-family-tracking.sql`). `src/middleware/authenticate.ts` gates protected routes; `requireAdmin.ts` gates admin endpoints; `auditMiddleware.ts` writes to the audit log.
- **Migrations** are raw SQL in `backend/migrations/` (`node-pg-migrate` with `--migration-file-language sql`). `database.json` reads `DATABASE_URL` from env for `dev`/`test`/`production`. `seed.sql` is separate from migrations.
- **Cron jobs** in `src/jobs/` are wired up by `startScheduler()` (called from `server.ts` except in `NODE_ENV=test`). Jobs: cart expiry (3am), reorder reminders (10am), campaign scheduler (hourly), push receipt checker (every 30min), review reminders (11am).
- **Static uploads** (e.g. ticket attachments) are written to `./uploads/` and served at `/uploads`. In prod this is a Docker volume (`api-uploads`) so files survive rebuilds.
- **API responses** always go through `utils/apiResponse.ts` (`success`/`error` helpers returning `{ success, data | error: { message, code } }`). Error codes are Spanish-first.
- ESLint enforces 2-space indent, LF line endings, double quotes, semicolons (`backend/.eslintrc.json`).

## Frontend architecture

- **expo-router** file-based routing in `frontend/app/`. `_layout.tsx` is the root shell; `(tabs)/` is the bottom-tab group (`index`, `categories`, `deals`, `orders`, `profile`). Other top-level screens (product-detail, cart, payment, support, …) are registered as `Stack.Screen` in the root layout.
- **Provider order** (root → leaf, in `_layout.tsx`): `ErrorBoundary` › `ThemeProvider` › `SafeAreaProvider` › `StripeProviderWrapper` › `LanguageProvider` › `AuthProvider` › `CartProvider` › `NavigationGuard`. Don't reorder without checking dependencies — `CartProvider` reads from `AuthProvider`, etc.
- **NavigationGuard** inside `_layout.tsx` drives onboarding: unauthenticated users without `preferred_lang` go to `language-select`, then `onboarding`, then `login/register`; authenticated users without completed onboarding (`onboarding_done` in AsyncStorage) go to `terms-accept`.
- **Stripe** has platform-split implementations — `StripeProviderWrapper.native.tsx` / `.web.tsx` and `useStripePay.native.ts` / `.web.ts`. Metro picks the right file by extension; never import the wrapper directly without the split suffix present.
- **API client** is `lib/api.ts`: auto-refresh on 401, token persistence via `AsyncStorage` under `auth_tokens`, `API_HOST` comes from `EXPO_PUBLIC_API_HOST` (defaults to prod HTTPS).
- **i18n**: 3 languages (`es`, `ca`, `en`). All strings live in `lib/i18n.ts`. Use the `useLang()` hook from `contexts/LanguageContext.tsx` and `t("section.key")` dot notation. The `const ca: typeof es = …` pattern makes TypeScript flag missing keys. Full i18n guide in `frontend/I18N_MANUAL.md`.
- **Styling** is NativeWind (Tailwind-for-RN). Design tokens in `theme.ts` / `theme.md`; layout conventions in `layout.md`.

## Admin architecture

Standard Vite React SPA. `App.tsx` defines all routes; `ProtectedRoute` redirects unauthenticated users to `/login`. All authenticated routes render inside `<Layout />`. The build output is mounted into the nginx container at `/var/www/admin` and served under the `/admin/` prefix.

## Landing architecture

Pre-renders one static `index.html` per route via `vite-react-ssg`. `src/routes.tsx` declares the same three pages (`/`, `/privacy`, `/terms`) three times — once each for ES/CA/EN via `<LangContext.Provider>`. When adding a new page, add **nine** route entries (3 paths × 3 languages) and update `src/seo/constants.ts` hreflang alternates + `public/sitemap.xml`. Translations live in `src/i18n/{es,ca,en}.ts` and must share the same shape (`typeof es`).

## Deployment

Production stack is defined in `deploy/docker-compose.prod.yml` (postgres + api + nginx + certbot). The admin and landing builds are produced **locally** and copied into `deploy/admin` and `deploy/landing` before shipping — they are not built inside containers. Migrations run via a one-shot `docker compose run --rm api npx node-pg-migrate up`. Full runbook: `deploy/README.md`. Secrets are generated by `deploy/setup-env.sh` into `deploy/.env`.

Stripe webhook URL in production: `https://DOMAIN/api/v1/payments/webhook` (body is raw-parsed — see `app.ts`).
