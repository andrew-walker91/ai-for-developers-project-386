# AGENTS.md

## Repo Shape
- Mixed repo: root `package.json` uses npm workspaces only for `apps/frontend` and `packages/typespec`; `apps/backend` is a standalone .NET 8 app and is not a workspace package.
- Frontend entrypoint is `apps/frontend/src/main.tsx`; the UI is currently a single Mantine app rooted in `apps/frontend/src/App.tsx`.
- Backend entrypoint is `apps/backend/Program.cs`; controllers live under `apps/backend/Controllers`, EF Core setup is in `apps/backend/Data/AppDbContext.cs`.
- API contract source is `packages/typespec/main.tsp`; generated OpenAPI is copied to `apps/backend/openapi.yaml` during the TypeSpec build. Do not hand-edit `apps/backend/openapi.yaml`.

## Commands
- Install JS deps from repo root with `npm install`.
- Frontend dev: `npm run dev:frontend`
- Frontend checks: `npm run lint:frontend`, `npm run typecheck:frontend`, `npm run build:frontend`
- TypeSpec checks/build: `npm run build:typespec` or, for a focused validation, `npm run check -w packages/typespec`
- Backend dev/build: `npm run dev:backend`, `npm run build:backend`, or run `dotnet build` / `dotnet run` inside `apps/backend`
- Backend Docker image: `npm run docker:backend`

## Verification
- There is no root `test` script and no test project in the repo today. The practical verification set is:
  `npm run lint:frontend` -> `npm run typecheck:frontend` -> `npm run build:frontend` -> `npm run build:typespec` -> `dotnet build` in `apps/backend`.
- `npm run build:typespec` rewrites `apps/backend/openapi.yaml` as a side effect.
- `npm run build:frontend` writes build output to `apps/frontend/dist`.

## Gotchas
- Frontend path alias `@/*` is configured in both `apps/frontend/vite.config.ts` and `apps/frontend/tsconfig.json`; keep them in sync if aliasing changes.
- Backend uses SQLite via the hardcoded connection string in `apps/backend/Program.cs`: `Data Source=bookings.db`. There are no checked-in migrations or appsettings files.
- Swagger UI is only enabled in development (`Program.cs`).
- The TypeSpec contract currently emits kebab-case paths such as `/api/event-types`, but ASP.NET controllers use `[Route("api/[controller]")]`, which serves `/api/EventTypes`, `/api/Bookings`, and `/api/Slots`. If you touch API routes, reconcile both sides instead of updating only one.

## CI / Instructions
- Preserve `.github/workflows/hexlet-check.yml`; the repo workflow README says it is auto-generated and should not be edited or removed.
- No repo-local OpenCode, Cursor, Claude, or Copilot instruction files are present beyond this file.
