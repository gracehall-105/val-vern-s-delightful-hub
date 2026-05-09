import { Butterfly } from "./Butterfly";

const competitors = [
  { name: "Fidelity", share: 78, color: "oklch(0.55 0.16 250)" },
  { name: "Vanguard", share: 71, color: "oklch(0.55 0.13 145)" },
  { name: "Schwab", share: 64, color: "oklch(0.6 0.14 70)" },
  { name: "T. Rowe Price", share: 32, color: "oklch(0.55 0.12 30)" },
  { name: "Voya", share: 7, color: "var(--voya-orange)" },
];

const sparkPath =
  "M0,55 L40,52 L80,48 L120,50 L160,42 L200,38 L240,40 L280,33 L320,28 L360,22 L400,18";

export function DashboardPreview() {
  return (
    <section id="preview" className="relative py-24 md:py-32 bg-secondary/40">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-[0.2em] text-voya-orange font-semibold">
            Command Center
          </p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-medium leading-tight">
            One screen. The whole story.
          </h2>
          <p className="mt-4 text-lg text-foreground/70 leading-relaxed">
            Share of Model, gap score, twelve-week trend, competitor stack —
            built for the CMO's three-second glance and the analyst's deep dive.
          </p>
        </div>

        <div className="mt-12 relative">
          <Butterfly
            className="absolute -top-6 -right-2 animate-float hidden md:block"
            color="var(--voya-orange-light)"
            size={32}
          />

          <div className="relative rounded-3xl bg-card shadow-card border border-border overflow-hidden">
            {/* Top toolbar */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-white">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
                <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
                <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
                <span className="ml-3 text-xs text-muted-foreground font-medium">
                  geo-command.voya.internal / dashboard
                </span>
              </div>
              <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
                Updated 7:32 AM ET
              </span>
            </div>

            {/* Top accent bar — subtle gradient echo */}
            <div className="h-1 bg-gradient-voya" />

            <div className="grid lg:grid-cols-3 gap-6 p-6 md:p-8 bg-secondary/30">
              {/* KPI: Share of Model */}
              <div className="rounded-2xl bg-card border border-border p-6">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Share of Model</p>
                <p className="mt-3 font-display text-6xl font-medium text-voya-orange leading-none">7%</p>
                <p className="mt-2 text-sm text-foreground/70">Brand queries only · target 15%+</p>
                <div className="mt-4 h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full bg-gradient-voya" style={{ width: "12%" }} />
                </div>
              </div>

              {/* KPI: Gap Score */}
              <div className="rounded-2xl bg-card border border-border p-6">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Gap Score</p>
                <div className="mt-3 flex items-baseline gap-2">
                  <p className="font-display text-6xl font-medium text-foreground leading-none">9</p>
                  <p className="font-display text-2xl text-muted-foreground">/ 10</p>
                </div>
                <p className="mt-2 text-sm text-foreground/70">Prompts where Voya is invisible</p>
                <div className="mt-4 flex gap-1">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <span
                      key={i}
                      className="h-2 flex-1 rounded-sm"
                      style={{ background: i < 9 ? "var(--voya-purple)" : "var(--voya-orange)" }}
                    />
                  ))}
                </div>
              </div>

              {/* KPI: Articles this week */}
              <div className="rounded-2xl bg-card border border-border p-6">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Drafts ready</p>
                <p className="mt-3 font-display text-6xl font-medium text-foreground leading-none">6</p>
                <p className="mt-2 text-sm text-foreground/70">Awaiting Marketing review</p>
                <button className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-voya-orange">
                  Open pipeline →
                </button>
              </div>

              {/* Trend chart */}
              <div className="lg:col-span-2 rounded-2xl bg-card border border-border p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">12-week share trajectory</p>
                  <div className="flex gap-2 text-[11px] text-muted-foreground">
                    <span className="px-2 py-0.5 rounded-full bg-voya-orange/10 text-voya-orange">Voya</span>
                    <span className="px-2 py-0.5 rounded-full bg-secondary">Top 3 avg</span>
                  </div>
                </div>
                <svg viewBox="0 0 400 80" className="mt-4 w-full h-32">
                  <defs>
                    <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--voya-orange)" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="var(--voya-orange)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {/* Competitor baseline */}
                  <path
                    d="M0,30 L40,28 L80,30 L120,26 L160,28 L200,24 L240,26 L280,22 L320,24 L360,20 L400,22"
                    stroke="oklch(0.7 0.02 60)"
                    strokeWidth="1.5"
                    fill="none"
                    strokeDasharray="3 4"
                  />
                  {/* Voya line + fill */}
                  <path d={`${sparkPath} L400,80 L0,80 Z`} fill="url(#spark-fill)" />
                  <path d={sparkPath} stroke="var(--voya-orange)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                </svg>
                <div className="mt-2 flex justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
                  <span>Wk 1</span><span>Wk 4</span><span>Wk 8</span><span>Wk 12</span>
                </div>
              </div>

              {/* Competitor leaderboard */}
              <div className="rounded-2xl bg-card border border-border p-6">
                <p className="text-sm font-semibold">Competitor leaderboard</p>
                <ul className="mt-4 space-y-3">
                  {competitors.map((c) => (
                    <li key={c.name}>
                      <div className="flex items-center justify-between text-xs">
                        <span className={c.name === "Voya" ? "font-semibold" : ""}>{c.name}</span>
                        <span className="text-muted-foreground">{c.share}%</span>
                      </div>
                      <div className="mt-1.5 h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${c.share}%`, background: c.color }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
