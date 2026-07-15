import { useState, useEffect, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageIntro, Panel } from "@/components/app/AppShell";
import { ExternalLink, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";
import { API_BASE } from "@/lib/api";
import type { SourceData, SourceSummary } from "@/lib/queries";

export const Route = createFileRoute("/app/channels")({
  component: ChannelStrategy,
});

const CHANNEL_LABELS: Record<string, string> = {
  official: "Official sites",
  publication: "Publications & media",
  government: "Government & regulatory",
  forum: "Forums & communities",
  social: "Social media",
};

const CHANNEL_COLORS: Record<string, string> = {
  official: "#2563eb",
  publication: "#7c3aed",
  government: "#059669",
  forum: "#d97706",
  social: "#ec4899",
};

const CHANNEL_DESCRIPTIONS: Record<string, string> = {
  official:
    "Company websites, product pages, and branded portals that AI models cite when naming providers.",
  publication:
    "Third-party editorial content — blogs, news, comparison sites, educational media that AI uses for credibility.",
  government:
    "Regulatory filings, .gov pages, and compliance databases that ground factual claims.",
  forum:
    "Reddit, professional communities, review sites — user-generated signals AI models weigh for social proof.",
  social:
    "LinkedIn, X/Twitter, and other social platforms where brand presence amplifies visibility.",
};

function ChannelStrategy() {
  const [data, setData] = useState<SourceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedChannel, setExpandedChannel] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/som/sources?days=30`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<SourceData>;
      })
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const channels = useMemo(() => {
    if (!data) return [];
    return Object.entries(data.type_breakdown)
      .filter(([type]) => type !== "")
      .sort((a, b) => b[1] - a[1])
      .map(([type, citations]) => ({
        type,
        label: CHANNEL_LABELS[type] || type,
        citations,
        pct: Math.round((citations / data.total_citations) * 100),
        color: CHANNEL_COLORS[type] || "#6b7280",
      }));
  }, [data]);

  const sourcesByChannel = useMemo(() => {
    if (!data) return {} as Record<string, SourceSummary[]>;
    const grouped: Record<string, SourceSummary[]> = {};
    for (const s of data.sources) {
      if (!s.source_type) continue;
      if (!grouped[s.source_type]) grouped[s.source_type] = [];
      grouped[s.source_type].push(s);
    }
    for (const key of Object.keys(grouped)) {
      grouped[key] = grouped[key].slice(0, 15);
    }
    return grouped;
  }, [data]);

  const voyaPresence = useMemo(() => {
    if (!data) return {} as Record<string, { total: number; voyaCiting: number; pct: number }>;
    const result: Record<string, { total: number; voyaCiting: number; pct: number }> = {};
    const grouped: Record<string, SourceSummary[]> = {};
    for (const s of data.sources) {
      if (!s.source_type) continue;
      if (!grouped[s.source_type]) grouped[s.source_type] = [];
      grouped[s.source_type].push(s);
    }
    for (const [type, sources] of Object.entries(grouped)) {
      const voyaCiting = sources.filter((s) => s.for_voya_pct > 0).length;
      result[type] = {
        total: sources.length,
        voyaCiting,
        pct: sources.length > 0 ? Math.round((voyaCiting / sources.length) * 100) : 0,
      };
    }
    return result;
  }, [data]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-secondary rounded w-1/3" />
        <div className="h-4 bg-secondary rounded w-2/3" />
        <div className="h-64 bg-secondary rounded" />
      </div>
    );
  }

  if (!data || data.total_citations === 0) {
    return (
      <div>
        <PageIntro
          eyebrow="Create · Channel strategy"
          title="Where should Voya publish next?"
          lede="AI models cite specific channels when answering questions. This view shows which publication channels get the most citations — and where Voya is missing."
        />
        <div className="text-center py-12 text-muted-foreground">
          <p>No source data available yet. Run a measurement batch to populate channel insights.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageIntro
        eyebrow="Create · Channel strategy"
        title="Where should Voya publish next?"
        lede="AI models cite specific channels when answering questions. This view shows which publication channels get the most citations — and where Voya is missing."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Panel>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Total citations</p>
          <p className="mt-1 text-2xl font-display">{data.total_citations.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Last 30 days</p>
        </Panel>
        <Panel>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Unique sources</p>
          <p className="mt-1 text-2xl font-display">{data.total_sources.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Distinct publications</p>
        </Panel>
        <Panel>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Voya present</p>
          <p className="mt-1 text-2xl font-display">{data.voya_sources}</p>
          <p className="text-xs text-muted-foreground">Sources citing Voya</p>
        </Panel>
        <Panel>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Coverage gap</p>
          <p className="mt-1 text-2xl font-display text-amber-600">
            {data.total_sources > 0
              ? Math.round(((data.total_sources - data.voya_sources) / data.total_sources) * 100)
              : 0}
            %
          </p>
          <p className="text-xs text-muted-foreground">Sources without Voya</p>
        </Panel>
      </div>

      <Panel title="Channel distribution" hint="Where AI pulls its citations from">
        <div className="space-y-4">
          {channels.map((ch) => {
            const presence = voyaPresence[ch.type];
            const isExpanded = expandedChannel === ch.type;
            return (
              <div key={ch.type}>
                <button
                  onClick={() => setExpandedChannel(isExpanded ? null : ch.type)}
                  className="w-full text-left cursor-pointer group"
                  aria-expanded={isExpanded}
                  aria-controls={`channel-details-${ch.type}`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: ch.color }} />
                      <span className="text-sm font-medium group-hover:text-voya-orange transition-colors">
                        {ch.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{ch.citations.toLocaleString()} cites</span>
                      <span className="font-semibold text-foreground">{ch.pct}%</span>
                      {presence && (
                        <span
                          className={`flex items-center gap-1 ${
                            presence.pct > 5 ? "text-emerald-600" : "text-amber-600"
                          }`}
                        >
                          {presence.pct > 5 ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <AlertTriangle className="h-3 w-3" />
                          )}
                          Voya in {presence.pct}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="h-3 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${ch.pct}%`, backgroundColor: ch.color }}
                    />
                  </div>
                </button>

                {isExpanded && (
                  <div
                    id={`channel-details-${ch.type}`}
                    className="mt-3 ml-5 pl-4 border-l-2 border-border space-y-3"
                  >
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {CHANNEL_DESCRIPTIONS[ch.type] || ""}
                    </p>

                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                        Top sources · {ch.label}
                      </p>
                      <div className="space-y-1">
                        {(sourcesByChannel[ch.type] || []).map((src, i) => (
                          <div
                            key={`${src.source_name}-${i}`}
                            className="flex items-center justify-between py-1 px-2 rounded hover:bg-secondary/60 text-xs"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-muted-foreground w-4 text-right shrink-0">
                                {i + 1}.
                              </span>
                              <span className="truncate">{src.source_name}</span>
                              {src.for_voya_pct > 0 && (
                                <span className="shrink-0 text-[9px] px-1.5 py-0.5 rounded-full bg-voya-orange/10 text-voya-orange font-medium">
                                  Voya cited
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 shrink-0 ml-2">
                              <span className="text-muted-foreground">{src.citations} cites</span>
                              <span className="text-muted-foreground">{src.prompts}p</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel className="mt-6" title="Strategic recommendations" hint="Based on citation patterns">
        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-voya-orange" />
              <p className="text-sm font-medium">Priority channels</p>
            </div>
            <div className="space-y-2">
              {channels
                .filter((ch) => {
                  const presence = voyaPresence[ch.type];
                  return presence && presence.pct < 5 && ch.citations > 30;
                })
                .map((ch) => (
                  <div
                    key={ch.type}
                    className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800"
                  >
                    <p className="text-sm font-medium">{ch.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {ch.citations.toLocaleString()} citations, but Voya appears in only{" "}
                      {voyaPresence[ch.type]?.pct || 0}% of sources. High-volume channel with visibility gap.
                    </p>
                  </div>
                ))}
              {channels.filter((ch) => {
                const presence = voyaPresence[ch.type];
                return presence && presence.pct < 5 && ch.citations > 30;
              }).length === 0 && (
                <p className="text-xs text-muted-foreground">
                  All high-volume channels have adequate Voya presence.
                </p>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <ExternalLink className="h-4 w-4 text-voya-purple" />
              <p className="text-sm font-medium">Top sources without Voya</p>
            </div>
            <div className="space-y-1.5">
              {data.sources
                .filter((s) => s.for_voya_pct === 0 && s.citations >= 3)
                .slice(0, 8)
                .map((src, i) => (
                  <div
                    key={`${src.source_name}-${i}`}
                    className="flex items-center justify-between text-xs py-1.5 px-2 rounded hover:bg-secondary/60"
                  >
                    <span className="truncate">{src.source_name}</span>
                    <span className="text-muted-foreground shrink-0 ml-2">
                      {src.citations} cites across {src.prompts} prompts
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
}
