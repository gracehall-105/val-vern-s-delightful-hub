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

/**
 * True when a real backend is reachable.
 *
 * In the Lovable preview there is no FastAPI backend on this origin, so
 * same-origin API calls hit the SSR server and return 500. Feature code should
 * check this before firing requests and show a friendly message instead.
 */
export const HAS_API_BACKEND: boolean =
  Boolean(API_BASE) ||
  (typeof window !== "undefined" && !/\.lovable\.app$|^localhost$|^127\./.test(window.location.hostname));
