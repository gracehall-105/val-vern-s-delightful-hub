import { useState, useEffect, useMemo } from 'react';
import {
  Target,
  TrendingUp,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  BarChart3,
  Loader2,
  Crosshair,
  Users,
  Sparkles,
} from 'lucide-react';
import { API_BASE } from '@/lib/api';

/* ── Data Types ─────────────────────────────────────────────────── */

interface OpportunityGap {
  prompt_id: string;
  prompt_text: string;
  voya_share: number;
  competitor_shares: Record<string, number>;
  leader_company: string;
  leader_share: number;
  citation_volume: number;
  competitor_count: number;
  competitive_density: number;
  feasibility: number;
  opportunity_score: number;
  gap_type: string;
  sources_cited: string[] | null;
  domain: string;
  audience: string;
}

interface GapResponse {
  gaps: OpportunityGap[];
  total_gaps: number;
  zero_share_count: number;
  high_opportunity_count: number;
  avg_score: number;
}

/* ── Score tier helpers ─────────────────────────────────────────── */

function scoreTier(score: number): { label: string; color: string; bg: string } {
  if (score >= 60) return { label: 'High', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-500/15 border-red-500/20' };
  if (score >= 35) return { label: 'Medium', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-500/15 border-orange-500/20' };
  return { label: 'Low', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/15 border-blue-500/20' };
}

function feasibilityLabel(f: number): string {
  if (f >= 0.8) return 'Very High';
  if (f >= 0.6) return 'High';
  if (f >= 0.4) return 'Moderate';
  return 'Difficult';
}

const gapTypeLabel: Record<string, string> = {
  comparison: 'Comparison',
  decision_logic: 'How-to',
  factual_reference: 'Factual',
  scenario: 'Scenario',
  general: 'General',
};

/* ── Component ──────────────────────────────────────────────────── */

interface Props {
  onActivate?: (topic: string, articleType: string, rationale: string, targetGap: string) => void;
}

export function OpportunityGapCalculator({ onActivate }: Props) {
  const [data, setData] = useState<GapResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activating, setActivating] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'zero' | 'high'>('all');
  const [domainFilter, setDomainFilter] = useState<string>('all');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/som/opportunity-gaps`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setData(json);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  /* ── Derived data ─────────────────────────────────────────────── */

  const gaps = data?.gaps || [];

  const domains = useMemo(() => {
    const set = new Set<string>();
    for (const g of gaps) {
      if (g.domain) set.add(g.domain);
    }
    return Array.from(set).sort();
  }, [gaps]);

  const filtered = useMemo(() => {
    let items = gaps;
    if (filter === 'zero') items = items.filter((g) => g.voya_share === 0);
    if (filter === 'high') items = items.filter((g) => g.opportunity_score >= 50);
    if (domainFilter !== 'all') items = items.filter((g) => g.domain === domainFilter);
    return items;
  }, [gaps, filter, domainFilter]);

  /* ── Activate handler ─────────────────────────────────────────── */

  async function handleActivate(gap: OpportunityGap) {
    if (onActivate) {
      onActivate(
        gap.prompt_text,
        gap.gap_type === 'comparison' ? 'comparison' : 'guide',
        `Voya is invisible (${gap.voya_share}% share) while ${gap.leader_company} leads at ${gap.leader_share}%. Opportunity Score: ${gap.opportunity_score}. ${gap.competitor_count} competitors present.`,
        gap.prompt_text
      );
      return;
    }

    // Direct pipeline trigger if no navigate callback
    setActivating(gap.prompt_id);
    try {
      const res = await fetch(`${API_BASE}/pipeline/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: gap.prompt_text,
          article_type: gap.gap_type === 'comparison' ? 'comparison' : 'guide',
        }),
      });
      if (!res.ok) throw new Error(`Pipeline returned ${res.status}`);
      setError(null);
    } catch (e: unknown) {
      setError(`Activation failed for "${gap.prompt_text.slice(0, 50)}…": ${e instanceof Error ? e.message : 'unknown error'}`);
    } finally {
      setActivating(null);
    }
  }

  /* ── Render ───────────────────────────────────────────────────── */

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Header */}
      <div>
        <h2 className="font-display text-xl font-semibold text-foreground flex items-center gap-2">
          <Crosshair className="w-5 h-5 text-[hsl(var(--voya-orange))]" />
          Opportunity Gap Calculator
        </h2>
        <p className="mt-2 font-display text-lg md:text-xl text-foreground/85 leading-snug">
          Where is Voya completely invisible in AI responses, and which of those gaps are most winnable?
        </p>
        <p className="text-xs text-muted-foreground mt-1.5">
          Identifies where Voya is invisible in AI citations, scored by citation volume × competitive density × feasibility.
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center h-48 text-muted-foreground text-sm gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Calculating opportunity gaps…
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-600 dark:text-red-400">
          Failed to load opportunity data: {error}
        </div>
      )}

      {data && !loading && (
        <>
          {/* Filter bar */}
          <div className="flex items-center gap-2 flex-wrap">
            {([
              { key: 'all', label: 'All Gaps', count: gaps.length },
              { key: 'zero', label: 'Invisible (0%)', count: data.zero_share_count },
              { key: 'high', label: 'High Score (50+)', count: data.high_opportunity_count },
            ] as { key: typeof filter; label: string; count: number }[]).map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`text-xs px-3 py-1.5 rounded-full border transition cursor-pointer ${
                  filter === f.key
                    ? 'bg-[hsl(var(--voya-orange))] text-white border-[hsl(var(--voya-orange))]'
                    : 'bg-card border-border text-muted-foreground hover:text-foreground hover:border-foreground/20'
                }`}
              >
                {f.label}
                <span className="ml-1.5 opacity-70">{f.count}</span>
              </button>
            ))}

            {/* Domain dropdown */}
            {domains.length > 1 && (
              <select
                value={domainFilter}
                onChange={(e) => setDomainFilter(e.target.value)}
                className="text-xs px-3 py-1.5 rounded-full border border-border bg-card text-muted-foreground cursor-pointer"
              >
                <option value="all">All Domains</option>
                {domains.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            )}
          </div>

          {/* Empty state */}
          {filtered.length === 0 && (
            <div className="rounded-2xl bg-card border border-border p-10 text-center">
              <Target className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground/70">No opportunity gaps found</p>
              <p className="text-xs text-muted-foreground mt-1">
                Run a measurement cycle to generate gap data. Opportunities appear when Voya is absent or barely present in AI responses.
              </p>
            </div>
          )}

          {/* Gap cards */}
          {filtered.length > 0 && (
            <div className="space-y-3">
              {filtered.map((gap) => {
                const tier = scoreTier(gap.opportunity_score);
                const isExpanded = expandedId === gap.prompt_id;
                const isActivating = activating === gap.prompt_id;

                return (
                  <div
                    key={gap.prompt_id}
                    className={`rounded-xl bg-card border border-border overflow-hidden ${
                      gap.opportunity_score >= 60 ? 'border-l-4 border-l-red-500' :
                      gap.opportunity_score >= 35 ? 'border-l-4 border-l-orange-500' :
                      'border-l-4 border-l-blue-500'
                    }`}
                  >
                    {/* Summary row */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : gap.prompt_id)}
                      className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-secondary/50 transition cursor-pointer"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                      )}

                      {/* Score badge */}
                      <div className={`shrink-0 w-12 h-12 rounded-lg flex flex-col items-center justify-center border ${tier.bg}`}>
                        <span className={`text-lg font-bold leading-none ${tier.color}`}>
                          {Math.round(gap.opportunity_score)}
                        </span>
                        <span className="text-[8px] uppercase tracking-wider text-muted-foreground mt-0.5">score</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border ${tier.bg}`}>
                            {tier.label}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {gapTypeLabel[gap.gap_type] || gap.gap_type}
                          </span>
                          {gap.domain && (
                            <span className="text-[9px] bg-foreground/[0.04] text-muted-foreground rounded px-1.5 py-0.5">
                              {gap.domain}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-medium text-foreground truncate">{gap.prompt_text}</p>
                      </div>

                      {/* Voya share indicator */}
                      <div className="shrink-0 text-right">
                        <p className={`text-lg font-bold ${gap.voya_share === 0 ? 'text-red-500' : 'text-orange-500'}`}>
                          {gap.voya_share}%
                        </p>
                        <p className="text-[9px] text-muted-foreground">Voya share</p>
                      </div>
                    </button>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div className="border-t border-border bg-secondary/30 px-5 py-4 space-y-4">
                        {/* Score breakdown */}
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <div className="flex items-center gap-1.5 mb-1">
                              <BarChart3 className="w-3 h-3 text-muted-foreground" />
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Citation Volume</span>
                            </div>
                            <p className="text-sm font-medium">{gap.citation_volume} mentions</p>
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 mb-1">
                              <Users className="w-3 h-3 text-muted-foreground" />
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Density</span>
                            </div>
                            <p className="text-sm font-medium">{Math.round(gap.competitive_density * 100)}% fragmented</p>
                            <p className="text-[10px] text-muted-foreground">{gap.competitor_count} competitors</p>
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 mb-1">
                              <TrendingUp className="w-3 h-3 text-muted-foreground" />
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Feasibility</span>
                            </div>
                            <p className="text-sm font-medium">{feasibilityLabel(gap.feasibility)}</p>
                            <p className="text-[10px] text-muted-foreground">Leader: {gap.leader_company} ({gap.leader_share}%)</p>
                          </div>
                        </div>

                        {/* Competitor breakdown */}
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Competitive Landscape</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            {Object.entries(gap.competitor_shares)
                              .sort(([, a], [, b]) => b - a)
                              .slice(0, 5)
                              .map(([company, share]) => (
                                <span
                                  key={company}
                                  className="text-xs bg-foreground/[0.06] rounded-full px-2.5 py-1 flex items-center gap-1"
                                >
                                  <span className="font-medium">{company}</span>
                                  <span className="text-muted-foreground">{share.toFixed(0)}%</span>
                                </span>
                              ))}
                          </div>
                        </div>

                        {/* Sources cited */}
                        {gap.sources_cited && gap.sources_cited.length > 0 && (
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Sources Cited (Last 30 Days)</p>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {gap.sources_cited.map((s) => (
                                <span key={s} className="text-[10px] bg-foreground/[0.04] text-muted-foreground rounded-full px-2 py-0.5 border border-border">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Activation CTA */}
                        <div className="flex items-center gap-3 pt-2 border-t border-border">
                          <button
                            onClick={() => handleActivate(gap)}
                            disabled={isActivating}
                            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[hsl(var(--voya-orange))] to-[hsl(var(--voya-orange)/0.8)] text-white px-4 py-2 text-xs font-medium shadow-sm hover:shadow-md transition cursor-pointer disabled:opacity-50"
                          >
                            {isActivating ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Sparkles className="w-3 h-3" />
                            )}
                            {isActivating ? 'Generating…' : 'Generate Content for This Gap'}
                            <ArrowRight className="w-3 h-3" />
                          </button>
                          <span className="text-[10px] text-muted-foreground">
                            Triggers 13-agent orchestrator targeting this prompt
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
