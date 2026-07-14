/**
 * API base for the Databricks App backend.
 *
 * Databricks Apps serve the frontend and backend on the same origin, so the
 * default empty string means "call the backend at the same host as the UI"
 * (e.g. `fetch('/som/sources')`).
 *
 * For local dev pointing at a remote backend, set `VITE_API_BASE` in `.env.local`:
 *   VITE_API_BASE=https://your-databricks-app-host.databricks.app
 *
 * Note: `VITE_*` values are baked in at build time.
 */
export const API_BASE: string = import.meta.env.VITE_API_BASE ?? "";
