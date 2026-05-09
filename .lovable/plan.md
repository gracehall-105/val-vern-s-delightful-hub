## Goal

A delightful, brand-true landing page for **GEO Command** — Voya's internal AI-visibility marketing tool. The page must feel unmistakably Voya (orange-first, Optima headlines, Proxima Nova body, the Journey curve) and open with a playful **Val and Vern** garden scene with flowers and butterflies. Once "inside the app," visuals dial back to subtle echoes of that landing moment.

This deliverable is **UI/UX only** — no backend wiring, no real data hooks. End state: a polished landing page you can show Marketing, plus a clean visual language that translates to the app.

## On the Val & Vern artwork

You don't have official PNGs and the brand guide forbids altering or recreating them. So I'll generate **brand-faithful origami-style stand-in characters** (a fox and an owl in folded-paper style, Voya orange palette) clearly positioned as placeholders. In the handoff prompt for VS Code, I'll flag exactly where to swap in the real licensed Val & Vern artwork. This keeps us safe with brand compliance while letting you preview the full experience.

## Landing page structure

1. **Top nav** — Voya wordmark left, slim links (Overview, How it works, Use cases, Dashboard preview), primary "Enter GEO Command" CTA right.
2. **Hero — "Val and Vern's garden"**
   - Side-by-side playful scene: origami fox + owl on a soft cream stage, orange→light-orange gradient sky behind, the Voya Journey curve sweeping under them, drifting butterflies and petals (subtle CSS animation, respects `prefers-reduced-motion`).
   - Optima headline: *"Be the answer, not an afterthought."*
   - Sub-deck in Proxima: one-liner about measuring, creating, and proving Voya's presence in AI answers.
   - Two CTAs: "Enter GEO Command" (orange) + "See how it works" (ghost).
3. **Trust strip** — "Phase 1 live • Powered by Azure OpenAI • Built on Voya infrastructure."
4. **The Loop — Measure → Create → Prove** — three cards with origami-flat icons, each tied to a brand color (orange, light orange, dark purple accent).
5. **Command Center preview** — A stylized mockup card (not real data) showing Share of Model KPI, Gap Score, the 12-week trend, competitor legend. Demonstrates the in-app aesthetic — clean dashboard with orange gradient accents, one butterfly motif tucked in a corner.
6. **Who it's for** — Three personas (CMO, Content Marketing, Digital Strategy) as quiet cards.
7. **Use cases / What it does (and doesn't)** — Two-column "Does / Doesn't" lifted from the PRD, written in Voya's "savviest best friend" voice.
8. **Phase 2 roadmap teaser** — VoC Listening Post, Content Scoring, Multi-Model — set on a gradient supergraphic background.
9. **Footer** — Voya logo, "For internal use only," capabilities line *Plan. Invest. Protect.*

## Visual system (added to `src/styles.css`)

- Color tokens in `oklch` mapped from the brand hexes:
  - `--voya-orange` `#FF4B00`, `--voya-orange-light` `#FF8000`, `--voya-purple` `#991350`, `--voya-dark-gray`, neutral grays per page 4 of the guide.
  - Semantic tokens (`--primary`, `--accent`, etc.) re-pointed to Voya palette so the rest of the app inherits the brand.
- Gradients: `--gradient-voya` (orange → light orange, left-to-right per brand rule), `--gradient-supergraphic`.
- Typography: load Optima (or "Cormorant Garamond" / system serif fallback if Optima isn't licensed in the browser) for headlines, Proxima Nova (fallback Inter) for body. Sentence case throughout — no all-caps, per the guide.
- Motion: subtle butterfly drift, petal fall, hover lift on cards. All respect `prefers-reduced-motion`.

## "Inside the app" treatment (subtle echoes)

A second route (`/dashboard-preview`) shows what the rest of the app should feel like: clean white surfaces, orange gradient accent bar, one or two whisper-quiet butterfly/petal motifs in empty states or section dividers — never crowding the data. This gives the Marketing team and your VS Code build a reference point.

## Files I'll create / change

- `src/styles.css` — Voya color tokens, gradients, typography setup.
- `src/routes/index.tsx` — full landing page.
- `src/routes/dashboard-preview.tsx` — in-app aesthetic reference.
- `src/components/landing/*` — Hero, LoopSection, DashboardPreviewCard, Personas, DoesDoesnt, RoadmapTeaser, Footer, Butterflies (animated SVG), VoyaJourney (SVG curve).
- `src/assets/val-vern-placeholder.png` (generated origami scene), `src/assets/butterfly.svg`, `src/assets/petal.svg`.
- Root `__root.tsx` head metadata: title "GEO Command — Voya," internal-tool description.

## Out of scope (per your ask)

- No real data, no API calls, no auth, no backend.
- No code-splitting of components into your VS Code repo — you'll port via the handoff prompt.

## Handoff at the end

Once you approve the look, I'll give you a clean prompt for VS Code that lists: the design tokens, the component breakdown, the asset swap points (especially the Val & Vern placeholder), and the motion guidelines — so your existing wired-up prototype just inherits the new skin.

---

Approve this and I'll build it.