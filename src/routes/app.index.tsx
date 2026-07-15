import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageIntro, Panel, Placeholder } from "@/components/app/AppShell";
import { CompetitiveContentCard } from "@/components/app/CompetitiveContentCard";
import { API_BASE } from "@/lib/api";
import type { CompetitiveSignal } from "@/lib/queries";

export const Route = createFileRoute("/app/")({
  component: CommandCenter,
});

function CommandCenter() {
  const [signals, setSignals] = useState<CompetitiveSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE}/competitive/signals?days=7`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<{ signals: CompetitiveSignal[] }>;
      })
      .then((d) => {
        if (cancelled) return;
        setSignals(d.signals ?? []);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError("Live signals unavailable — connect the backend to populate.");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <PageIntro
        eyebrow="Command Center"
        title="Today, at a glance."
        lede="Where Voya stands in AI answers, what moved this week, and what the team should look at next."
      />

      <div className="grid lg:grid-cols-4 gap-5">
        {[
          { k: "Share of Model", v: "—%", note: "Brand queries" },
          { k: "Gap Score", v: "— / 10", note: "Invisible prompts" },
          { k: "Drafts ready", v: "—", note: "Awaiting review" },
          { k: "Prompts tracked", v: "—", note: "Across categories" },
        ].map((c) => (
          <Panel key={c.k}>
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{c.k}</p>
            <p className="mt-3 font-display text-5xl text-foreground leading-none">{c.v}</p>
            <p className="mt-2 text-xs text-foreground/60">{c.note}</p>
          </Panel>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-5 mt-5">
        <Panel className="lg:col-span-2" title="12-week share trajectory" hint="Voya vs. top 3 avg">
          <Placeholder label="Trend chart" height={220} />
        </Panel>
        <Panel title="Competitor leaderboard" hint="Updated daily">
          <ul className="space-y-3">
            {["Fidelity", "Vanguard", "Schwab", "T. Rowe Price", "Voya"].map((n) => (
              <li key={n} className="text-sm">
                <div className="flex justify-between text-xs">
                  <span className={n === "Voya" ? "font-semibold" : ""}>{n}</span>
                  <span className="text-muted-foreground">—%</span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-secondary" />
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mt-5">
        <CompetitiveContentCard signals={signals} loading={loading} error={error} />
        <Panel title="Recommended next actions" hint="From Measure → Create">
          <Placeholder label="Top 5 prompts to brief next" height={180} />
        </Panel>
      </div>
    </>
  );
}
