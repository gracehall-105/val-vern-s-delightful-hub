import { useState, useEffect, useMemo } from 'react';
import {
  Lightbulb,
  AlertTriangle,
  Target,
  Zap,
  TrendingUp,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Shield,
  BarChart3,
} from 'lucide-react';
import { API_BASE } from '@/lib/api';

/* ── Orchestrator Recommendation (single data source) ───────────── */

interface OrchestratorRec {
  id: number;
  cycle_id: string;
  rank: number;
  topic: string;
  headline: string;
  article_type: string;
  rationale: string;
  priority: string;
  rec_type: string;
  audience: string;
  category: string;
  target_gap: string;
  keywords: string[];
  est_impact: string;
  findability: number;
  status: string;
}

/* ── Synthesised Card ───────────────────────────────────────────── */

type CardType = 'critical_gap' | 'recommendation' | 'quick_win' | 'competitive_threat';

interface OpportunityCard {
  id: string;
  type: CardType;
  title: string;
  description: string;
  priority: string;        // critical | high | medium
  impact: string;          // human-readable impact estimate
  meta: string[];          // tag-like metadata (gap type, article type, keywords)
  sources: string[];       // competitors cited / related
  action?: string;         // suggested next step
  _rec?: OrchestratorRec;  // original rec for onNavigate
}

/* ── rec_type → CardType mapping ────────────────────────────────── */

function recTypeToCardType(recType: string): CardType {
  switch (recType) {
    case 'quick_win': return 'quick_win';
    case 'threat': return 'competitive_threat';
    case 'channel': return 'critical_gap';
    default: return 'recommendation';
  }
}

/* ── Badge / colour helpers ─────────────────────────────────────── */

const typeLabel: Record<CardType, string> = {
  critical_gap: 'Citation Gap',
  recommendation: 'Content Idea',
  quick_win: 'Quick Win',
  competitive_threat: 'Competitive Threat',
};

const typeIcon: Record<CardType, typeof AlertTriangle> = {
  critical_gap: AlertTriangle,
  recommendation: BookOpen,
  quick_win: Zap,
  competitive_threat: Shield,
};

const priorityColor: Record<string, string> = {
  critical: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20',
  high:     'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/20',
  medium:   'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20',
};

const typeBg: Record<CardType, string> = {
  critical_gap:       'border-l-red-500',
  recommendation:     'border-l-[hsl(var(--voya-orange))]',
  quick_win:          'border-l-emerald-500',
  competitive_threat: 'border-l-purple-500',
};

/* ── Component ──────────────────────────────────────────────────── */

interface OpportunitySynthesisProps {
  onNavigate?: (topic: string, articleType: string, rationale: string, targetGap: string) => void;
}

export function OpportunitySynthesis({ onNavigate }: OpportunitySynthesisProps) {
  const [recs, setRecs] = useState<OrchestratorRec[]>([]);
  const [cycleId, setCycleId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<CardType | 'all'>('all');

  /* ── Single fetch: orchestrator recommendation store ──────────── */

  useEffect(() => {
    fetch(`${API_BASE}/recommendations`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.recommendations) {
          setRecs(data.recommendations);
          setCycleId(data.cycle_id ?? null);
        }
      })
      .catch(() => { /* recommendations are non-critical */ })
      .finally(() => setLoading(false));
  }, []);

  /* ── Map orchestrator recs → OpportunityCards ──────────────────── */

  const cards: OpportunityCard[] = useMemo(() => {
    return recs.map((r) => {
      const cardType = recTypeToCardType(r.rec_type);
      return {
        id: `orch-${r.id}`,
        type: cardType,
        title: r.headline || r.topic,
        description: r.rationale,
        priority: r.priority || 'medium',
        impact: r.est_impact || 'Potential share improvement',
        meta: [r.article_type, ...(r.keywords || []).slice(0, 3)].filter(Boolean),
        sources: [],
        action: r.target_gap
          ? `Target gap: ${r.target_gap}`
          : 'Open in Content Pipeline',
        _rec: r, // keep reference for onNavigate
      };
    });
  }, [recs]);

  /* ── Filtered view ────────────────────────────────────────────── */

  const filtered = useMemo(() => {
    if (filter === 'all') return cards;
    return cards.filter((c) => c.type === filter);
  }, [cards, filter]);

  /* ── KPIs ─────────────────────────────────────────────────────── */

  const criticalCount = cards.filter((c) => c.priority === 'critical').length;
  const gapCount = cards.filter((c) => c.type === 'critical_gap').length;
  const recCount = cards.filter((c) => c.type === 'recommendation').length;
  const qwCount = cards.filter((c) => c.type === 'quick_win').length;

  /* ── Render ───────────────────────────────────────────────────── */

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Header */}
      <div>
        <h2 className="font-display text-xl font-semibold text-foreground flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-[hsl(var(--voya-orange))]" />
          Opportunity Synthesis
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Ranked opportunities from the 13-agent orchestrator brain — content ideas, quick wins, and competitive threats.
          {cycleId && <> <span className="opacity-50">Cycle: {cycleId.slice(0, 16)}</span></>}
        </p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total', value: cards.length, icon: Lightbulb, accent: 'text-foreground' },
          { label: 'Critical', value: criticalCount, icon: AlertTriangle, accent: 'text-red-500' },
          { label: 'Gaps', value: gapCount, icon: Target, accent: 'text-orange-500' },
          { label: 'Quick Wins', value: qwCount, icon: Zap, accent: 'text-emerald-500' },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-xl bg-card border border-border p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <kpi.icon className={`w-3.5 h-3.5 ${kpi.accent}`} />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{kpi.label}</span>
            </div>
            <p className={`font-display text-2xl font-bold ${kpi.accent}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {([
          { key: 'all', label: 'All', count: cards.length },
          { key: 'critical_gap', label: 'Citation Gaps', count: gapCount },
          { key: 'recommendation', label: 'Content Ideas', count: recCount },
          { key: 'quick_win', label: 'Quick Wins', count: qwCount },
          { key: 'competitive_threat', label: 'Threats', count: cards.filter((c) => c.type === 'competitive_threat').length },
        ] as { key: CardType | 'all'; label: string; count: number }[]).map((f) => (
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
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
          Synthesizing opportunities…
        </div>
      )}

      {/* Empty state */}
      {!loading && cards.length === 0 && (
        <div className="rounded-2xl bg-card border border-border p-10 text-center">
          <Lightbulb className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground/70">No recommendations yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Run an orchestrator deliberation cycle to generate recommendations. They will appear here automatically.
          </p>
        </div>
      )}

      {/* Opportunity cards */}
      {!loading && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((card) => {
            const Icon = typeIcon[card.type];
            const isExpanded = expandedId === card.id;

            return (
              <div
                key={card.id}
                className={`rounded-xl bg-card border border-border border-l-4 ${typeBg[card.type]} overflow-hidden`}
              >
                {/* Summary row */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : card.id)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-secondary/50 transition cursor-pointer"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}

                  <Icon className="w-4 h-4 shrink-0 text-muted-foreground" />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border ${priorityColor[card.priority] || priorityColor.medium}`}>
                        {card.priority}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{typeLabel[card.type]}</span>
                    </div>
                    <p className="text-sm font-medium text-foreground truncate">{card.title}</p>
                  </div>

                  {/* Source avatars */}
                  {card.sources.length > 0 && (
                    <div className="flex items-center gap-1 shrink-0">
                      {card.sources.slice(0, 3).map((s) => (
                        <span
                          key={s}
                          className="text-[9px] bg-foreground/[0.06] text-muted-foreground rounded px-1.5 py-0.5"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-border bg-secondary/30 px-5 py-4 space-y-3">
                    <p className="text-sm text-foreground/80 leading-relaxed">{card.description}</p>

                    {/* Impact estimate */}
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-xs text-foreground/70">{card.impact}</span>
                    </div>

                    {/* Tags */}
                    {card.meta.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {card.meta.map((m) => (
                          <span
                            key={m}
                            className="text-[10px] bg-foreground/[0.04] text-muted-foreground rounded-full px-2 py-0.5 border border-border"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Action */}
                    {card.action && (
                      <div className="flex items-center gap-2 pt-1">
                        {onNavigate && card._rec ? (
                          <button
                            onClick={() =>
                              onNavigate(
                                card._rec!.topic,
                                card._rec!.article_type || 'guide',
                                card._rec!.rationale,
                                card._rec!.target_gap || ''
                              )
                            }
                            className="text-xs font-medium text-[hsl(var(--voya-orange))] hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            Open in Content Pipeline
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        ) : (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <BarChart3 className="w-3 h-3" />
                            {card.action}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Filtered empty */}
      {!loading && filtered.length === 0 && cards.length > 0 && (
        <div className="rounded-xl bg-card border border-border p-6 text-center">
          <p className="text-sm text-muted-foreground">No opportunities match this filter.</p>
        </div>
      )}
    </div>
  );
}
