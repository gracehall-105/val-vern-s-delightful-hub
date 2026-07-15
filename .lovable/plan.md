## Goal

Make this Lovable project the single source of truth for Beacon's **frontend UI**. Reconcile the four files you uploaded (from your VS Code build) with the visual polish already here (Beacon lockup, Val & Vern, butterflies, Voya tokens, Journey curve, motion, snap-scroll landing, AppShell chrome). End in mind: you stop editing UI in VS Code and edit it here in Lovable, then deploy the built static assets as a **Databricks App** frontend that talks to your Databricks-hosted backend.

## What Databricks allows (short version)

Databricks **Apps** (the current product — "Warehouse Apps" isn't the official name) run inside Databricks and support:

- **Static frontends** — any framework that builds to static HTML/JS/CSS (Vite/React works). Serve `dist/` behind the app's built-in web server.
- **A backend process** alongside the frontend — commonly Python (FastAPI/Flask/Streamlit/Dash) or Node. That is where your existing Python/Databricks SQL logic lives.
- **Same-origin** frontend ↔ backend calls (so `API_BASE=""` and paths like `/som/sources` just work — no CORS setup).
- **Databricks-managed auth** — the signed-in Databricks user is passed to the backend via headers; the app can call Databricks SQL / Unity Catalog on their behalf.
- **Env vars & secrets** injected at runtime (`VITE_*` at build for the frontend, real secrets to the backend).
- **Size/runtime limits** apply (small compute, no long-lived websockets by default, no arbitrary native binaries in the frontend build) — nothing we're doing bumps into these.

Net: a Vite React SPA that fetches `${API_BASE}/...` is exactly the shape Databricks Apps expects. Perfect fit.

## What I see in the four uploaded files

1. **`AppShell.tsx` (yours)** — only exports `PageIntro`, `Panel`, `Placeholder`. Ours has those *plus* the sidebar, topbar, Beacon lockup, theme toggle. Compatible — same primitive names, same props.
2. **`CompetitiveContentCard.tsx`** — real component, types from `../lib/queries`, uses `react-router-dom` `useNavigate`.
3. **`ChannelStrategy.tsx`** — full page, fetches `${API_BASE}/som/sources?days=30`, channel breakdown with colors + copy.
4. **`ActivationPanel.tsx`** — insight → content → review → destination → publish side panel, fetches `${API_BASE}/content/activate`.

Signal: your VS Code app is **React Router DOM + `fetch(API_BASE)`**. This project is **TanStack Router**. That router mismatch is the main reconciliation decision.

## The plan

### Phase 0 — One decision from you: the router

- **A. Convert uploaded files to TanStack Router** (keep everything we've built here — snap-scroll landing, file-based routes, SEO head, AppShell). Mechanical swaps: `react-router-dom` → `@tanstack/react-router`, `useNavigate` API is nearly identical, `<Link to>` unchanged.
- **B. Switch this project to React Router DOM** so future VS Code pastes drop in with zero rewrite. Cost: rebuild landing routing + head metadata; we lose some TanStack niceties but gain 1:1 parity.

Recommendation: **A**. Databricks doesn't care which router — both build to static — and A preserves more of what you like here.

### Phase 1 — Frontend contract for Databricks Apps

- Add `src/lib/api.ts` exporting `API_BASE = import.meta.env.VITE_API_BASE ?? ""` (empty default = same-origin, which is what Databricks Apps gives you).
- Add `src/lib/queries.ts` with the shared TS types your uploaded components import (`CompetitiveSignal`, `Citation`, plus what `ChannelStrategy` and `ActivationPanel` need).
- Treat this repo as **frontend-only**: no Lovable Cloud, no Supabase, no TanStack `createServerFn` for real data. If we need mocks locally, they're plain client stubs.
- Add `databricks-app.md` documenting: `bun run build` → `dist/`, env vars, same-origin backend expectation, auth header pass-through.

### Phase 2 — Merge uploaded pages into our shell

- Keep our `AppShell` (sidebar + topbar + Beacon + theme toggle). Add your `PageIntro` / `Panel` / `Placeholder` exports alongside — same names, drop-in for your pages.
- Port `ChannelStrategy` → `/app/prove/channels` (or whichever slot in the nav you prefer).
- Port `CompetitiveContentCard` → Command Center (`/app`).
- Port `ActivationPanel` → mounted from Measure/Prove rows as a slide-in.
- All three keep their `fetch(${API_BASE}/...)` calls untouched.

### Phase 3 — Preserve the cool Lovable-side work

Explicitly kept:
- Landing route `/` — snap-scroll slides, Beacon nav, Val & Vern with butterflies, Journey divider, personas, does/doesn't, roadmap, pinned footer.
- Beacon `VoyaLogo` component + assets.
- Voya tokens & gradients in `src/styles.css`, motion keyframes, dark mode.
- AppShell chrome, `ThemeToggle`, and the primitives.
- Cormorant Garamond / Inter fonts from `__root.tsx`.

### Phase 4 — Prove the Databricks fit

- Confirm `bun run build` produces a clean static `dist/` with no server-only runtime dependencies.
- Verify no route or component secretly relies on a Node/edge server function at request time.
- Note the one gotcha: **`VITE_API_BASE` is baked at build time**. If you want to point the same build at different Databricks environments, either rebuild per env or serve the API same-origin (recommended — no env var needed).

## What I need from you before I start

1. **Router: A (convert your files to TanStack) or B (switch project to React Router DOM)?**
2. Any other VS Code files you want in this first reconciliation pass, or start with these four?

Approve and I'll execute.