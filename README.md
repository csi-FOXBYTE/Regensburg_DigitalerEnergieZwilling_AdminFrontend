# Digitaler Energie Zwilling — Admin Frontend

Vite + React SPA for the admin interface of the Digital Energy Twin platform.

## Getting started

```bash
pnpm install
cp .env.development.local.example .env.development.local
# fill in .env.development.local (see Dev auth section below)
pnpm dev
```

## Dev auth (temporary)

Real OIDC/Keycloak login is not yet wired. For local development, a JWT generated
by the backend's `pnpm jwt:dev` is read from `VITE_DEV_ACCESS_TOKEN` and attached
as `Authorization: Bearer <token>` to every request to the backend.

**This mechanism is completely disabled in production builds.** `import.meta.env.DEV`
is a compile-time literal — Rollup dead-code-eliminates all dev-auth paths during
`vite build`. You can verify with:

```bash
pnpm build && grep -r 'VITE_DEV_ACCESS_TOKEN' dist/   # must return nothing
```

### Setup

1. Copy `.env.development.local.example` to `.env.development.local` (already in `.gitignore`).
2. Generate a token in the backend repo:
   ```bash
   pnpm jwt:dev --ttl 2592000 --output raw
   ```
   The 30-day TTL avoids frequent regeneration during local development.
3. Paste the token and set the API base URL in `.env.development.local`:
   ```
   VITE_API_BASE_URL=http://localhost:5000
   VITE_DEV_ACCESS_TOKEN=<paste token here>
   ```
4. Run `pnpm dev`.

Removing or clearing `VITE_DEV_ACCESS_TOKEN` means no `Authorization` header is sent
— requests to `/api/admin/*` will return 401, which is the correct failure mode.

## Generating the API client

The typed API client (`src/api/api.gen.ts`) is generated from the backend's OpenAPI
spec via [orval](https://orval.dev). The backend must be running (APISIX on port 5000):

```bash
pnpm gen:api
```

All generated hooks route through `src/api/client.ts`, which handles base URL
resolution and dev-auth header injection. Do not hand-edit `api.gen.ts`.

## Environment variables

| Variable | Required in dev | Effect in prod |
|---|---|---|
| `VITE_API_BASE_URL` | Yes (`http://localhost:5000`) | Leave empty — requests are same-origin via APISIX |
| `VITE_DEV_ACCESS_TOKEN` | Yes (JWT from `pnpm jwt:dev`) | None — code path is dead-code-eliminated |
