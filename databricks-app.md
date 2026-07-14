# Beacon frontend on Databricks Apps

This project is the **frontend only** for Beacon. It is designed to be deployed
as the static UI of a [Databricks App](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/),
paired with your own backend process (Python/FastAPI in your VS Code repo)
that talks to Databricks SQL / Unity Catalog.

## Build

```bash
bun install
bun run build
```

Output: `dist/` (static HTML/JS/CSS). Upload this directory as the frontend
of your Databricks App, or serve it from your backend process.

## Backend contract

All data calls hit `${API_BASE}${path}`. `API_BASE` comes from
`src/lib/api.ts`, which reads `import.meta.env.VITE_API_BASE`.

- **Same-origin deployment (recommended):** leave `VITE_API_BASE` unset. The
  frontend calls `/som/sources`, `/content/activate`, etc. on the same host
  as the UI — Databricks Apps handles this natively, no CORS setup.
- **Split deployment:** set `VITE_API_BASE=https://your-backend-host` at
  build time. Remember `VITE_*` bakes into the bundle, so one build = one target.

Types the backend must return live in `src/lib/queries.ts`. Keep those in
sync with your FastAPI response models.

## Auth

Databricks passes the signed-in user to your backend via
`X-Forwarded-Access-Token` / `X-Forwarded-User` headers. The frontend does
not read these — it relies on the backend to authorize each request.

## Editing UX in Lovable, deploying via Databricks

1. Make UI changes here in Lovable.
2. `bun run build`.
3. Ship `dist/` to your Databricks App (or wire your backend's static
   handler to serve it).

The backend stays in your VS Code repo. This project never talks to
Databricks directly.
