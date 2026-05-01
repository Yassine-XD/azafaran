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

## Ops shortcuts (`./azafaran`)

Repo-wide bash helper at `./azafaran` wraps every common task. Run with no args for the categorized cheat-sheet, or `./azafaran help <category>` for a single namespace.

```bash
./azafaran                              # full help
./azafaran dev:db:up                    # local Postgres
./azafaran dev:migrate:up               # apply migrations locally
./azafaran dev:test                     # backend Jest

./azafaran build:all                    # build admin + landing
./azafaran ship:all                     # stage builds into deploy/

# On the VPS, inside the repo dir:
./azafaran prod:rebuild api             # redeploy the api container
./azafaran prod:migrate:up              # apply pending migrations
./azafaran prod:logs api -n 200         # tail api logs
./azafaran notif:campaigns 5            # debug push delivery
./azafaran notif:log <campaign_id>      # per-user delivery rows
```

Destructive commands (`*:reset`, `*:rebuild`, `db:restore`, `notif:opt-in`, `prod:down`) prompt for confirmation; pass `-y` to skip.

The raw `npm run …` / `docker compose …` commands below still work — `./azafaran` is a thin convenience layer, not a replacement.

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
- **Provider order** (root → leaf, in `_layout.tsx`): `ErrorBoundary` › `ThemeProvider` › `SafeAreaProvider` › `StripeProviderWrapper` › `LanguageProvider` › `AuthProvider` › `NotificationProvider` › `CartProvider` › `NavigationGuard` (with `<NotificationsBridge />` mounted inside it). Don't reorder without checking dependencies — `CartProvider` reads from `AuthProvider`; `NotificationProvider` watches auth to register/unregister the Expo push token; the bridge needs router + cart for tap routing.
- **NavigationGuard** inside `_layout.tsx` drives onboarding: unauthenticated users without `preferred_lang` go to `language-select`, then `onboarding`, then `login/register`; authenticated users without completed onboarding (`onboarding_done` in AsyncStorage) go to `terms-accept`.
- **Stripe** has platform-split implementations — `StripeProviderWrapper.native.tsx` / `.web.tsx` and `useStripePay.native.ts` / `.web.ts`. Metro picks the right file by extension; never import the wrapper directly without the split suffix present.
- **API client** is `lib/api.ts`: auto-refresh on 401, token persistence via `AsyncStorage` under `auth_tokens`, `API_HOST` comes from `EXPO_PUBLIC_API_HOST` (defaults to prod HTTPS).
- **i18n**: 3 languages (`es`, `ca`, `en`). All strings live in `lib/i18n.ts`. Use the `useLang()` hook from `contexts/LanguageContext.tsx` and `t("section.key")` dot notation. The `const ca: typeof es = …` pattern makes TypeScript flag missing keys. Full i18n guide in `frontend/I18N_MANUAL.md`.
- **Styling** is NativeWind (Tailwind-for-RN). Design tokens in `theme.ts` / `theme.md`; layout conventions in `layout.md`.

## Admin architecture

Standard Vite React SPA. `App.tsx` defines all routes; `ProtectedRoute` redirects unauthenticated users to `/login`. All authenticated routes render inside `<Layout />`. The build output is mounted into the nginx container at `/var/www/admin` and served under the `/admin/` prefix.

The send-notification form is `src/pages/NotificationsPage.tsx`. It posts a structured `payload` to `POST /admin/notifications/send` whose shape depends on the chosen destination (none / screen / product / coupon) — see the *Push notifications* section below.

## Landing architecture

Pre-renders one static `index.html` per route via `vite-react-ssg`. `src/routes.tsx` declares the same three pages (`/`, `/privacy`, `/terms`) three times — once each for ES/CA/EN via `<LangContext.Provider>`. When adding a new page, add **nine** route entries (3 paths × 3 languages) and update `src/seo/constants.ts` hreflang alternates + `public/sitemap.xml`. Translations live in `src/i18n/{es,ca,en}.ts` and must share the same shape (`typeof es`).

## Push notifications

End-to-end Expo push: admin sends → backend pushes via Expo → device receives even when app is closed → tap routes to a screen, product, or cart with auto-applied coupon.

**Wire-format payload** (canonical contract — same shape on backend, on the wire in Expo `data`, persisted in `notification_log.data`):

```jsonc
{ "v": 1, "type": "none|screen|product|coupon|order|campaign|survey",
  "screen?": "deals|orders|profile|categories|index",
  "productId?": "uuid", "promoCode?": "WELCOME10", "orderId?": "uuid",
  "surveyId?": "uuid",
  "logId?": "uuid", "campaignId?": "uuid" }
```

Validated by `notificationPayloadSchema` (zod discriminated union on `type`) in `backend/src/validators/notification.schema.ts`. The legacy `notification_campaigns.deep_link` text column is kept only for admin display — never read on the device.

**Backend** (key files):
- `services/expoPush.service.ts` — singleton `Expo` SDK wrapper (chunked send, chunked receipt fetch).
- `services/notification.service.ts` — `sendOrderNotification` and `sendCustomNotification(userIds, …, payload)`. Embeds `logId` into `data` so the device can `POST /notifications/opened/:logId`.
- `services/admin.service.ts.createCampaign` — validates the destination (product exists / promo code is active / screen is allowed), persists the campaign with `payload` JSONB, then either fires immediately (no `scheduled_at`, or it's in the past) or leaves it `draft` for the cron. Empty `scheduled_at` is stamped with `NOW()` because the column is `NOT NULL`.
- `jobs/campaignScheduler.job.ts` — hourly cron that picks up `status='draft' AND scheduled_at <= NOW()` rows.
- `jobs/receiptChecker.job.ts` — every 30 min, calls `expo.getPushNotificationReceiptsAsync`, flips `sent → delivered|failed`, deactivates tokens reported as `DeviceNotRegistered`.
- Migration `029_add-campaign-payload.sql` adds the `payload` column.
- Optional env: `EXPO_ACCESS_TOKEN` for stronger auth on Expo's push API.

**Frontend** (key files):
- `lib/notifications.ts` — permission, `getExpoPushTokenAsync({ projectId })`, Android channel setup, register/unregister with backend. Skips silently in Expo Go.
- `lib/notificationPayload.ts` — runtime parser mirroring the backend contract.
- `lib/notificationRouter.ts` — pure function `routeFromPayload(payload, { router, applyPromo, isAuthenticated })`; one switch on `type`.
- `lib/pendingNotificationAction.ts` — in-memory stash for cold-start replay (the listener may fire before `CartProvider`/auth are ready).
- `contexts/NotificationContext.tsx` — registers the Expo token on first auth, unregisters on logout. `useRef` dedupes.
- `contexts/CartContext.tsx` — drains pending `coupon` actions: navigates to `/cart` and silently calls `applyPromo`.
- `components/NotificationsBridge.tsx` — handles cold-start (`getLastNotificationResponseAsync`) + warm taps (`addNotificationResponseReceivedListener`); marks `logId` opened.

**Admin**: `src/pages/NotificationsPage.tsx` has a "Al pulsar la notificación" destination dropdown (none / screen / product autocomplete via `GET /admin/products?search=` / coupon code / survey via `GET /admin/surveys?published=true`).

**Surveys** (in-app forms): admins build a survey at `/admin/surveys` (title + dynamic question list with types `text`, `single_choice`, `multi_choice`, `rating`, `yes_no`, `number`), publish it, then send a campaign with `payload.type = "survey"` so taps open `frontend/app/survey.tsx`. Backend layering: `routes/survey.routes.ts` → `controllers/survey.controller.ts` → `services/survey.service.ts` (validates each answer against its question type) → `repositories/survey.repository.ts`. Schema: `migrations/031_create-surveys.sql` (`surveys` + `survey_responses` with `UNIQUE (survey_id, user_id)` enforcing one response per user). Admin survey CRUD lives in `admin.service.ts` / `admin.controller.ts`; user-facing endpoints `GET /surveys/:id`, `GET /surveys/:id/me` (returns `{ submitted: boolean }`), `POST /surveys/:id/responses`. Responses can be exported to CSV from `/admin/surveys/:id/responses`.

**Recipient gating**: campaigns with `target=all` only push to users with `notification_preferences.promotions = true` (default `false` for new users). For testing, opt a user in with `./azafaran notif:opt-in <user_id>`. Order events bypass this gate.

**Build / credentials**: requires an EAS dev-client — push does **not** work in Expo Go on SDK 53+. `frontend/app.json` references `./google-services.json` (gitignored, drop in locally before building). FCM v1 service account JSON is uploaded once via `eas credentials` (Android → Push Notifications: FCM V1). The legacy FCM key path is shut down by Google as of 2024-06-20 and must be removed from EAS credentials, or it sabotages the v1 path.

**Debugging**: see `./azafaran notif:campaigns`, `notif:log <id>`, `notif:tokens`, `notif:tail-failed`. A row with `status='sent'` AND `expo_receipt_id IS NULL` means the user had no active push tokens (in-app history only); a real push has a populated receipt id.

## Deployment

Production stack is defined in `deploy/docker-compose.prod.yml` (postgres + api + nginx + certbot). The admin and landing builds are produced **locally** and copied into `deploy/admin` and `deploy/landing` before shipping — they are not built inside containers. Migrations run via a one-shot `docker compose run --rm api npx node-pg-migrate up`. Full runbook: `deploy/README.md`. Secrets are generated by `deploy/setup-env.sh` into `deploy/.env`.

Stripe webhook URL in production: `https://DOMAIN/api/v1/payments/webhook` (body is raw-parsed — see `app.ts`).
