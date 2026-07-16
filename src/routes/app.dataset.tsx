import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import data from "@/lib/dummy-data.json";
import { Database, Search } from "lucide-react";

export const Route = createFileRoute("/app/dataset")({
  head: () => ({
    meta: [
      { title: "Prompt Dataset — Voya Beacon" },
      { name: "description", content: "Browse the 444-prompt universe with 10 weeks of Share-of-Model data." },
    ],
  }),
  component: DatasetPage,
});

type Prompt = {
  id: string;
  text: string;
  category: string;
  audience: string;
  domain: string;
  cluster_id: string;
};

type ShareRow = {
  prompt_id: string;
  shares: Record<string, number>;
  voya_sources: string[];
};

const VOYA_ORANGE = "#ff570c";

function DatasetPage() {
  const prompts = data.prompts as Prompt[];
  const shares = data.shares as ShareRow[];
  const weeks = data.weeks as string[];
  const companies = data.companies as string[];

  const shareById = useMemo(() => {
    const m = new Map<string, ShareRow>();
    for (const s of shares) m.set(s.prompt_id, s);
    return m;
  }, [shares]);

  const [q, setQ] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [audience, setAudience] = useState<string>("all");

  const categories = useMemo(
    () => Array.from(new Set(prompts.map((p) => p.category))).sort(),
    [prompts],
  );
  const audiences = useMemo(
    () => Array.from(new Set(prompts.map((p) => p.audience))).sort(),
    [prompts],
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return prompts.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (audience !== "all" && p.audience !== audience) return false;
      if (needle && !p.text.toLowerCase().includes(needle) && !p.id.includes(needle)) return false;
      return true;
    });
  }, [prompts, q, category, audience]);

  const summary = useMemo(() => {
    if (filtered.length === 0) return { voyaAvg: 0, leader: "—", leaderAvg: 0 };
    const totals: Record<string, number> = Object.fromEntries(companies.map((c) => [c, 0]));
    for (const p of filtered) {
      const row = shareById.get(p.id);
      if (!row) continue;
      for (const c of companies) totals[c] += row.shares[c] ?? 0;
    }
    const avgs = Object.fromEntries(
      Object.entries(totals).map(([c, v]) => [c, v / filtered.length]),
    );
    const sorted = Object.entries(avgs).sort((a, b) => b[1] - a[1]);
    return {
      voyaAvg: avgs["Voya"] ?? 0,
      leader: sorted[0][0],
      leaderAvg: sorted[0][1],
    };
  }, [filtered, shareById, companies]);

  return (
    <div className="p-6 md:p-8 space-y-6">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Database className="h-4 w-4" />
            Prompt Dataset
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold mt-1">
            {data.prompt_count} prompts · {weeks.length} weeks
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Latest week: {weeks[weeks.length - 1]} · {companies.length} tracked competitors
          </p>
        </div>
        <div className="flex gap-3">
          <Stat label="Voya avg SoM" value={`${summary.voyaAvg.toFixed(1)}%`} accent />
          <Stat label={`${summary.leader} avg SoM`} value={`${summary.leaderAvg.toFixed(1)}%`} />
          <Stat label="Shown" value={`${filtered.length}`} />
        </div>
      </header>

      <div className="flex gap-2 flex-wrap items-center">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search prompts…"
            className="w-full pl-9 pr-3 py-2 rounded-md border border-border bg-background text-sm"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="py-2 px-3 rounded-md border border-border bg-background text-sm"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
          className="py-2 px-3 rounded-md border border-border bg-background text-sm"
        >
          <option value="all">All audiences</option>
          {audiences.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <div className="max-h-[calc(100vh-320px)] overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 sticky top-0 z-10">
              <tr className="text-left">
                <th className="px-3 py-2 font-medium">ID</th>
                <th className="px-3 py-2 font-medium">Prompt</th>
                <th className="px-3 py-2 font-medium">Category</th>
                <th className="px-3 py-2 font-medium">Audience</th>
                <th className="px-3 py-2 font-medium">Domain</th>
                <th className="px-3 py-2 font-medium text-right">Voya SoM</th>
                <th className="px-3 py-2 font-medium">Leader</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 300).map((p) => {
                const row = shareById.get(p.id);
                const voya = row?.shares["Voya"] ?? 0;
                let leader = "—";
                let leaderVal = -1;
                if (row) {
                  for (const [c, v] of Object.entries(row.shares)) {
                    if (v > leaderVal) { leaderVal = v; leader = c; }
                  }
                }
                const voyaLeads = leader === "Voya";
                return (
                  <tr key={p.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-3 py-2 text-muted-foreground font-mono text-xs">{p.id}</td>
                    <td className="px-3 py-2 max-w-[420px]">{p.text}</td>
                    <td className="px-3 py-2 text-muted-foreground">{p.category}</td>
                    <td className="px-3 py-2 text-muted-foreground">{p.audience}</td>
                    <td className="px-3 py-2 text-muted-foreground">{p.domain}</td>
                    <td className="px-3 py-2 text-right font-medium" style={{ color: VOYA_ORANGE }}>{voya}%</td>
                    <td className="px-3 py-2">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={
                          voyaLeads
                            ? { background: `${VOYA_ORANGE}1a`, color: VOYA_ORANGE }
                            : { background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))" }
                        }
                      >
                        {leader} {leaderVal}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length > 300 && (
          <div className="px-3 py-2 text-xs text-muted-foreground border-t border-border bg-muted/30">
            Showing first 300 of {filtered.length}. Refine filters to narrow.
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-md border border-border px-4 py-2 min-w-[120px]">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold" style={accent ? { color: VOYA_ORANGE } : undefined}>{value}</div>
    </div>
  );
}
