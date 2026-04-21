# AGENTS.md

## Repo Shape
- Mixed repo: root `package.json` uses npm workspaces only for `apps/frontend` and `packages/typespec`; `apps/backend` is a standalone .NET 8 app and is not a workspace package.
- Frontend entrypoint is `apps/frontend/src/main.tsx`; the UI is currently a single Mantine app rooted in `apps/frontend/src/App.tsx`.
- Backend entrypoint is `apps/backend/Program.cs`; controllers live under `apps/backend/Controllers`, EF Core setup is in `apps/backend/Data/AppDbContext.cs`.
- API contract source is `packages/typespec/main.tsp`; generated OpenAPI is copied to `apps/backend/openapi.yaml` during the TypeSpec build. Do not hand-edit `apps/backend/openapi.yaml`.
- Generated TS types are placed at `apps/frontend/src/api/schema.ts` (do not hand-edit).

## Commands
**Все команды — только через Makefile** (`make <target>`):
- `make install` — npm install
- `make dev` — инструкция для двух терминалов: `make dev-prism` и `make dev-frontend`
- `make dev-frontend` — Vite dev server на :5173
- `make dev-prism` — TypeSpec → OpenAPI → TS types + Prism mock на :3000
- `make dev-backend` — dotnet run
- `make build` — build-typespec + build-frontend
- `make lint` — eslint
- `make typecheck` — tsc --noEmit
- `make test` — lint + typecheck
- `make docker` — docker build для бэка

## Verification
- `make test` — линтер + тайпчек фронта
- `make build` — TypeSpec + фронт

## Gotchas
- Frontend path alias `@/*` is configured in both `apps/frontend/vite.config.ts` and `apps/frontend/tsconfig.json`; keep them in sync if aliasing changes.
- Backend uses SQLite via the hardcoded connection string in `apps/backend/Program.cs`: `Data Source=bookings.db`. There are no checked-in migrations or appsettings files.
- Swagger UI is only enabled in development (`Program.cs`).
- The TypeSpec contract currently emits kebab-case paths such as `/api/event-types`, but ASP.NET controllers use `[Route("api/[controller]")]`, which serves `/api/EventTypes`, `/api/Bookings`, and `/api/Slots`. If you touch API routes, reconcile both sides instead of updating only one.
- Vite proxy in `apps/frontend/vite.config.ts` forwards `/api/*` to `VITE_API_TARGET` (default: `http://localhost:3000` for Prism mock). Override with `.env` file.

## CI / Instructions
- Preserve `.github/workflows/hexlet-check.yml`; the repo workflow README says it is auto-generated and should not be edited or removed.
- No repo-local OpenCode, Cursor, Claude, or Copilot instruction files are present beyond this file.
