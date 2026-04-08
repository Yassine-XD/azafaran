# CLAUDE.md — Azafaran

Azafaran is a halal meat delivery e-commerce platform. It consists of three apps: a React Native mobile/web storefront, a React admin dashboard, and an Express.js backend API with PostgreSQL.

## Project Structure

```
azafaran/
├── backend/       # Express.js REST API (TypeScript)
├── frontend/      # Expo React Native app (iOS/Android/Web)
├── admin/         # React + Vite admin dashboard
└── deploy/        # Production Docker Compose, Nginx, SSL
```

## Tech Stack

| Layer    | Technology |
|----------|-----------|
| Backend  | Node.js, Express 5, TypeScript, PostgreSQL 15 |
| Frontend | React Native 0.81, Expo SDK 54, Expo Router 6, NativeWind v4 (Tailwind) |
| Admin    | React 19, Vite 6, Tailwind CSS 4, React Router 7 |
| Payments | Stripe (server + client) |
| Auth     | JWT access/refresh tokens, bcrypt |
| Validation | Zod schemas |
| Icons    | Lucide React / Lucide React Native |

## Architecture

**Backend** follows controller → service → repository pattern:
- `src/controllers/` — HTTP handlers
- `src/services/` — business logic
- `src/repositories/` — SQL queries (raw `pg` client, no ORM)
- `src/validators/` — Zod request schemas
- `src/middleware/` — auth, validation, error handling, audit
- `src/jobs/` — cron-scheduled tasks (reminders, cart expiry, campaigns)
- `src/routes/` — Express route definitions, aggregated in `routes/index.ts`

**Frontend** uses Expo Router file-based routing:
- `app/(tabs)/` — bottom tab screens (home, categories, deals, orders, profile)
- `app/` — standalone screens (login, register, onboarding, cart, payment, etc.)
- `lib/api.ts` — centralized API client with token refresh
- `contexts/` — AuthContext (JWT + AsyncStorage), CartContext
- `hooks/` — platform-specific Stripe hooks (`.web.ts` / `.native.ts`)

**Admin** is a standard Vite SPA:
- `src/pages/` — dashboard, users, products, orders, promotions, etc.
- `src/lib/api.ts` — admin API client

## Infrastructure

### Docker (development)

PostgreSQL runs in Docker. The backend runs outside Docker.

```bash
# Start Postgres
cd backend && docker compose up -d

# Check Postgres is healthy
docker exec azafaran-postgres pg_isready -U postgres
```

Container: `azafaran-postgres` | User: `postgres` | Password: `password` | DB: `azafaran` | Port: `5432`

### Running Migrations

Migrations are plain SQL files in `backend/migrations/` (numbered 001–022).

```bash
# Run a migration against Docker Postgres
docker exec -i azafaran-postgres psql -U postgres -d azafaran < backend/migrations/NNN_migration-name.sql
```

### Starting the Apps

```bash
# Backend (from backend/)
npm run dev          # ts-node-dev with hot reload on port 3000

# Frontend (from frontend/)
npx expo start       # Expo dev server

# Admin (from admin/)
npm run dev          # Vite dev server
```

### Environment

Backend expects a `.env` file (see `.env.example`):
- `DATABASE_URL` — Postgres connection string
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` — token signing keys
- `PORT` — API port (default 3000)
- `CLIENT_URL` — frontend origin for CORS

## Code Conventions

- **Language**: UI text is in Spanish (es). Backend error messages are also in Spanish.
- **Styling**: Frontend uses NativeWind (Tailwind classes via `className` prop). Admin uses Tailwind CSS.
- **API responses**: Standardized via `src/utils/apiResponse.ts` — `{ success, data, message }`.
- **Error handling**: `appError()` utility throws typed errors caught by error middleware.
- **Async routes**: Wrapped with `asyncHandler()` to forward errors to Express error middleware.
- **SQL**: Raw parameterized queries (`$1`, `$2`, ...) — no ORM. Dynamic UPDATE builders for partial updates.
- **Auth flow**: 3-step onboarding (register → profile-setup → terms-accept). Returning users go through login and skip onboarding.
- **Navigation guard**: `_layout.tsx` checks AsyncStorage `onboarding_done` flag + auth state to route new vs returning users.

## Testing

```bash
cd backend && npm test              # run all tests
cd backend && npm run test:watch    # watch mode
cd backend && npm run test:coverage # with coverage
```

Tests live in `backend/src/tests/` using Jest + ts-jest.

## Common Tasks

**Add a new API endpoint:**
1. Create/update Zod schema in `src/validators/`
2. Add repository method in `src/repositories/`
3. Add service method in `src/services/`
4. Add controller handler in `src/controllers/`
5. Register route in `src/routes/`

**Add a new frontend screen:**
1. Create file in `frontend/app/` (Expo Router auto-registers it)
2. If it needs a tab, add to `app/(tabs)/`
3. If it needs auth, use `useAuth()` from AuthContext

**Add a new migration:**
1. Create `backend/migrations/NNN_description.sql` (next number in sequence)
2. Run with: `docker exec -i azafaran-postgres psql -U postgres -d azafaran < backend/migrations/NNN_description.sql`

## Production Deployment

Production uses a full Docker Compose stack (see `deploy/`):
- PostgreSQL, Express API, Nginx reverse proxy, Certbot SSL
- Config: `deploy/docker-compose.prod.yml`
- Env setup: `deploy/setup-env.sh`
- Guide: `deploy/README.md`
