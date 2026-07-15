// @ts-nocheck — direct port from VS Code; tighten types incrementally
import { useState, useEffect, useMemo, useRef } from 'react';
import { Crosshair, TrendingUp, Eye, BarChart3, Loader2, DollarSign, Users, Zap } from 'lucide-react';
import { API_BASE } from '@/lib/api';

/* ── Constants ──────────────────────────────────────────────────── */

// Voya's fair market share benchmark based on AUM (~$735B) and
// ~6M workplace participants in the retirement/benefits space.
// Configurable — update annually or when market data changes.
// Branded target (90%): For brand queries, Voya is the primary authoritative source.
//   10% allowance for legitimate third-party inclusion (regulators, independent analysts,
//   review sites, competitors) when they materially improve the answer or when users
//   explicitly signal need for comparisons/broader market context. (current: 75.4%)
const FAIR_SHARE_TARGET_UNBRANDED = 8;
const FAIR_SHARE_TARGET_BRANDED = 90;
const VOYA_AUM_BILLIONS = 735;
const VOYA_PARTICIPANTS_MILLIONS = 6;
// Conservative multiplier: each AI citation reaches ~50 unique users/month
const CITATION_REACH_MULTIPLIER = 50;

const CHANNEL_LABELS: Record<string, string> = {
  official: 'Official Sites',
  publication: 'Publications & Media',
  government: 'Government & Regulatory',
  forum: 'Forums & Communities',
  social: 'Social Media',
};

const CHANNEL_FAIR_SHARE: Record<string, number> = {
  publication: 10,
  official: 9,
  forum: 7,
  social: 8,
  government: 8,
};

/* ── Types ──────────────────────────────────────────────────────── */

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

interface SourceSummary {
  source_name: string;
  source_type: string;
  citations: number;
  prompts: number;
  for_voya_pct: number;
}

interface CompanyData {
  company: string;
  share_pct: number;
  citations: number;
  position: string;
}

interface ShareEntry {
  prompt_id: string;
  prompt: string;
  shares: Record<string, number>;
}

interface PromptEntry {
  id: string;
  text: string;
  domain: string;
}

/* ── Animated counter hook ──────────────────────────────────────── */

function useCountUp(target: number, duration = 800, enabled = true) {
  const [value, setValue] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled || target === 0) { setValue(target); return; }
    const start = performance.now();
    const from = 0;
    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (progress < 1) frameRef.current = requestAnimationFrame(tick);
    }
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration, enabled]);

  return value;
}

/* ── Component ──────────────────────────────────────────────────── */

interface Props {
  onActivate?: (topic: string, articleType: string, rationale: string, targetGap: string) => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function OpportunityGapCalculator(_props: Props) {
  const [gapData, setGapData] = useState<GapResponse | null>(null);
  const [sources, setSources] = useState<SourceSummary[]>([]);
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [shareEntries, setShareEntries] = useState<ShareEntry[]>([]);
  const [prompts, setPrompts] = useState<PromptEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'channel' | 'domain'>('channel');
  const [selectedBranding, setSelectedBranding] = useState<'unbranded' | 'branded'>('unbranded');

  // Fetch all data (with branding filter where supported)
  // Note: Branding filter applied to companies and shares endpoints:
  // - Opportunity gaps are prompt-level and consistent across branded/unbranded selection
  // - The branding toggle changes which FAIR SHARE TARGET applies to the same gaps
  // - Company shares and domain breakdowns are filtered by branding for UI consistency
  // Phase 2 enhancement: Apply branding filter to /som/sources and /som/opportunity-gaps for fully-separate analysis
  useEffect(() => {
    async function load() {
      try {
        const [gapRes, srcRes, compRes, sharesRes, promptsRes] = await Promise.all([
          fetch(`${API_BASE}/som/opportunity-gaps`),
          fetch(`${API_BASE}/som/sources?days=30`),
          fetch(`${API_BASE}/som/companies?branding=${selectedBranding}`),
          fetch(`${API_BASE}/som/shares?branding=${selectedBranding}`),
          fetch(`${API_BASE}/som/prompts`),
        ]);
        if (gapRes.ok) {
          const d = await gapRes.json();
          console.log('✓ Gaps loaded:', d?.gaps?.length || 0, 'gaps, impressionsAtStake base:', d?.gaps?.reduce((s, g) => s + g.citation_volume, 0) || 0);
          setGapData(d);
        } else {
          console.warn('✗ Gaps fetch failed:', gapRes.status);
          setGapData({ gaps: [], total_gaps: 0, zero_share_count: 0, high_opportunity_count: 0, avg_score: 0 });
        }
        if (srcRes.ok) {
          const d = await srcRes.json();
          setSources(d.sources || []);
        }
        if (compRes.ok) {
          const d = await compRes.json();
          setCompanies(d.companies || []);
        }
        if (sharesRes.ok) {
          const d = await sharesRes.json();
          setShareEntries(d.shares || []);
        }
        if (promptsRes.ok) {
          const d = await promptsRes.json();
          setPrompts(d.prompts || []);
        }
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selectedBranding]);

  /* ── Derived metrics ────────────────────────────────────────── */

  const voyaAiShare = useMemo(() => {
    const voya = companies.find(c => c.company === 'Voya');
    return Math.round(voya?.share_pct || 0);
  }, [companies]);

  const fairShareTarget = selectedBranding === 'branded' ? FAIR_SHARE_TARGET_BRANDED : FAIR_SHARE_TARGET_UNBRANDED;

  const gaps = gapData?.gaps || [];

  const invisibleCount = useMemo(() =>
    gaps.filter(g => g.voya_share === 0).length,
  [gaps]);

  const totalPrompts = useMemo(() => {
    // Return actual total prompts being measured (not just gaps)
    return prompts.length || 444;
  }, [prompts]);

  const impressionsAtStake = useMemo(() =>
    (gapData?.gaps || []).reduce((sum, g) => sum + g.citation_volume, 0),
  [gapData]);

  // Channel opportunity data — per-channel Voya presence (same method as Channel Strategy)
  const channelBars = useMemo(() => {
    // Group sources by channel type and compute what % of sources cite Voya
    const grouped: Record<string, { total: number; voyaCiting: number }> = {};
    for (const src of sources) {
      const type = src.source_type || 'official';
      if (!grouped[type]) grouped[type] = { total: 0, voyaCiting: 0 };
      grouped[type].total++;
      if (src.for_voya_pct > 0) grouped[type].voyaCiting++;
    }

    return Object.entries(CHANNEL_LABELS)
      .map(([key, label]) => {
        const data = grouped[key];
        const aiShare = data && data.total > 0
          ? Math.round((data.voyaCiting / data.total) * 100)
          : voyaAiShare;
        const fairShare = CHANNEL_FAIR_SHARE[key] || fairShareTarget;
        const gap = Math.max(0, fairShare - aiShare);
        return { key, label, aiShare, fairShare, gap };
      })
      .sort((a, b) => b.gap - a.gap);
  }, [sources, voyaAiShare, fairShareTarget]);

  // Domain opportunity data — per-domain Voya share from shares + prompts
  const domainBars = useMemo(() => {
    // Build prompt_id → domain lookup
    const domainLookup: Record<string, string> = {};
    for (const p of prompts) {
      domainLookup[p.id] = p.domain;
    }

    // Accumulate Voya share per domain from actual measurement data
    const domainAcc: Record<string, { total: number; voyaSum: number; citations: number }> = {};

    if (shareEntries.length > 0 && prompts.length > 0) {
      for (const entry of shareEntries) {
        const domain = domainLookup[entry.prompt_id] || 'General';
        if (!domainAcc[domain]) domainAcc[domain] = { total: 0, voyaSum: 0, citations: 0 };
        domainAcc[domain].total++;
        domainAcc[domain].voyaSum += entry.shares?.Voya || 0;
      }
    }

    // Supplement with citation counts from gaps
    for (const g of gaps) {
      const d = g.domain || 'General';
      if (!domainAcc[d]) domainAcc[d] = { total: 0, voyaSum: 0, citations: 0 };
      domainAcc[d].citations += g.citation_volume;
    }

    return Object.entries(domainAcc)
      .filter(([, data]) => data.total > 0)
      .map(([domain, data]) => {
        const aiShare = data.total > 0 ? Math.round(data.voyaSum / data.total) : voyaAiShare;
        const fairShare = fairShareTarget;
        const gap = Math.max(0, fairShare - aiShare);
        return { key: domain, label: domain, aiShare, fairShare, gap };
      })
      .sort((a, b) => b.gap - a.gap)
      .slice(0, 6);
  }, [gaps, shareEntries, prompts, voyaAiShare, fairShareTarget]);

  const representationGap = fairShareTarget - voyaAiShare;
  const bars = viewMode === 'channel' ? channelBars : domainBars;

  // Animated values
  const animatedAiShare = useCountUp(voyaAiShare, 900, !loading);
  const animatedFairShare = useCountUp(fairShareTarget, 900, !loading);
  const animatedGap = useCountUp(representationGap, 1000, !loading);
  const animatedInvisible = useCountUp(invisibleCount, 800, !loading);

  /* ── Render ─────────────────────────────────────────────────── */

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading opportunity forecast…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-600 dark:text-red-400">
        Failed to load forecast data: {error}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-up max-w-4xl">
      {/* Page header — minimal */}
      <div>
        <h2 className="font-display text-xl font-semibold text-foreground flex items-center gap-2">
          <Crosshair className="w-5 h-5 text-voya-orange" />
          Opportunity Forecast
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Market representation analysis based on AUM, participants, and competitive positioning
        </p>
        
        {/* Branding toggle pills */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setSelectedBranding('unbranded')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              selectedBranding === 'unbranded'
                ? 'bg-voya-orange text-white'
                : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
            }`}
          >
            Unbranded
          </button>
          <button
            onClick={() => setSelectedBranding('branded')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              selectedBranding === 'branded'
                ? 'bg-voya-orange text-white'
                : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
            }`}
          >
            Branded
          </button>
        </div>
      </div>

      {/* ═══ HERO STATEMENT ═══ */}
      <div className="rounded-2xl bg-card border border-border shadow-card p-8 relative">
        {/* Subtle background gradient accent */}
        <div className="absolute inset-0 bg-gradient-to-br from-voya-orange/3 to-transparent pointer-events-none" />

        <div className="relative">
          {/* The big gap visualization */}
          <div className="flex items-center justify-center gap-6 mb-6">
            {/* AI Share */}
            <div className="text-center">
              <p className="font-display text-5xl font-extrabold tracking-tight text-foreground">
                {animatedAiShare}%
              </p>
              <p className="text-xs text-muted-foreground mt-1 font-medium uppercase tracking-wider">AI Share Today</p>
            </div>

            {/* Arrow / gap indicator */}
            <div className="flex flex-col items-center gap-1">
              <div className="w-24 h-[2px] bg-gradient-to-r from-voya-orange to-voya-orange/30 relative">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-l-[6px] border-l-voya-orange/30 border-y-[4px] border-y-transparent" />
              </div>
              <span className="text-[10px] font-bold text-voya-orange uppercase tracking-widest">
                +{animatedGap}pp gap
              </span>
            </div>

            {/* Fair Share target */}
            <div className="text-center">
              <p className="font-display text-5xl font-extrabold tracking-tight text-foreground/30">
                {animatedFairShare}%
              </p>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">
                Fair Share{' '}
                <span className="text-[10px] text-muted-foreground/60">({selectedBranding === 'branded' ? '90%' : '8%'})</span>
              </p>
            </div>
          </div>

          {/* Headline statement */}
          <p className="text-center text-lg font-medium text-foreground/90">
            AI is underweighting Voya by <span className="text-voya-orange font-bold">{representationGap} points</span>
          </p>

          {/* Supporting context */}
          <p className="text-center text-sm text-muted-foreground mt-2">
            {animatedInvisible} prompts where Voya should appear but doesn't
          </p>

          {/* Fair share explanation */}
          <p className="text-center text-xs text-muted-foreground/80 mt-3 max-w-md mx-auto leading-relaxed">
            {selectedBranding === 'branded' ? (
              <>Fair share is 90%: Voya should be the primary authoritative source for branded queries. The 10% allowance covers legitimate third-party inclusion (regulators, analysts, competitors) when they materially improve answers or when users seek broader market context (currently 75.4%).</>
            ) : (
              <>Fair share is the minimum citation rate Voya should receive — based on ${VOYA_AUM_BILLIONS}B AUM, {VOYA_PARTICIPANTS_MILLIONS}M participants, and a top-5 position in DC recordkeeping. If AI models were unbiased, Voya would appear in at least {FAIR_SHARE_TARGET_UNBRANDED}% of retirement answers.</>
            )}
          </p>

          {/* ── What closing the gap means (inline) ── */}
          <div className="mt-8 pt-6 border-t border-border/50">
            <h3 className="font-display text-base font-semibold text-foreground mb-1">
              What closing this gap means
            </h3>
            <p className="text-xs text-muted-foreground mb-5">
              If Voya's AI share reaches fair share ({fairShareTarget}%), here's the estimated business uplift
            </p>

            {impressionsAtStake === 0 && (
              <div className="mb-5 p-3 bg-amber-50/50 border border-amber-200/50 rounded-lg">
                <p className="text-xs text-amber-900/70">
                  <strong>Citation data not yet available</strong> — Recent measurement runs don't include mention counts. Numbers will populate once latest batch includes citation data (expected in next scheduled run).
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Citations recaptured */}
              <div className="rounded-xl bg-secondary/40 border border-border/50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="w-4 h-4 text-voya-orange" />
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Citations recaptured</span>
                </div>
                <p className="text-2xl font-display font-bold text-foreground">
                  +{voyaAiShare > 0 ? Math.round(impressionsAtStake * (representationGap / 100) * (fairShareTarget / voyaAiShare)).toLocaleString() : '0'}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">monthly AI mentions</p>
                <p className="text-[9px] text-muted-foreground/70 mt-2 leading-snug">How many AI mentions Voya loses monthly to competitors in zero-share prompts.</p>
              </div>

              {/* People reached */}
              <div className="rounded-xl bg-secondary/40 border border-border/50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-voya-orange" />
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">People reached</span>
                </div>
                <p className="text-2xl font-display font-bold text-foreground">
                  {(Math.round(impressionsAtStake * CITATION_REACH_MULTIPLIER * (representationGap / fairShareTarget)) / 1000).toFixed(0)}K
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">additional monthly impressions</p>
                <p className="text-[9px] text-muted-foreground/70 mt-2 leading-snug">How many actual people see those citations per month (using 50 people per citation as baseline).</p>
              </div>

              {/* Participant exposure */}
              <div className="rounded-xl bg-secondary/40 border border-border/50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-voya-orange" />
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Participant exposure</span>
                </div>
                <p className="text-2xl font-display font-bold text-foreground">
                  {((VOYA_PARTICIPANTS_MILLIONS * (representationGap / 100)) * 1000).toFixed(0)}K
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">of {VOYA_PARTICIPANTS_MILLIONS}M plan members asking AI</p>
              </div>

              {/* AUM at stake */}
              <div className="rounded-xl bg-secondary/40 border border-border/50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-voya-orange" />
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">AUM influenced</span>
                </div>
                <p className="text-2xl font-display font-bold text-foreground">
                  ${Math.round(VOYA_AUM_BILLIONS * (representationGap / 100))}B
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">of ${VOYA_AUM_BILLIONS}B at decision-point</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ═══ CHANNEL/DOMAIN BARS ═══ */}
      <div className="hidden rounded-2xl bg-card border border-border shadow-card p-6">
        {/* Section header with toggle */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <BarChart3 size={14} className="text-muted-foreground" />
            Where the gap is largest
          </h3>
          <div className="flex items-center rounded-lg border border-border bg-secondary/50 p-0.5">
            <button
              onClick={() => setViewMode('channel')}
              className={`px-3 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                viewMode === 'channel' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              By Channel
            </button>
            <button
              onClick={() => setViewMode('domain')}
              className={`px-3 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                viewMode === 'domain' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              By Domain
            </button>
          </div>
        </div>

        {/* Bar chart */}
        <div className="space-y-4">
          {bars.map((bar, idx) => {
            const maxFairShare = Math.max(...bars.map(b => b.fairShare));
            const barWidth = (bar.fairShare / maxFairShare) * 100;
            const filledWidth = bar.fairShare > 0 ? (bar.aiShare / bar.fairShare) * 100 : 0;

            return (
              <div key={bar.key} className="group" style={{ animationDelay: `${idx * 80}ms` }}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-foreground/85">{bar.label}</span>
                  <span className="text-xs font-semibold text-voya-orange">
                    +{bar.gap}pp gap
                  </span>
                </div>

                {/* Bar visualization */}
                <div className="relative h-8 rounded-lg overflow-hidden" style={{ width: `${barWidth}%` }}>
                  {/* Ghost bar (fair share target) */}
                  <div className="absolute inset-0 rounded-lg border-2 border-dashed border-foreground/10 bg-foreground/[0.02]" />

                  {/* Filled bar (actual AI share) */}
                  <div
                    className="absolute inset-y-0 left-0 rounded-lg bg-gradient-to-r from-voya-orange to-voya-orange/70 transition-all duration-1000 ease-out"
                    style={{ width: `${filledWidth}%` }}
                  >
                    {/* Pulse animation on the gap edge */}
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-voya-orange/50 animate-pulse" />
                  </div>

                  {/* Labels inside bar */}
                  <div className="absolute inset-0 flex items-center justify-between px-3">
                    <span className="text-[10px] font-bold text-white/90 drop-shadow-sm">
                      {bar.aiShare}%
                    </span>
                    <span className="text-[10px] font-bold text-white/90 drop-shadow-sm">
                      {bar.fairShare}% fair
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-6 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-gradient-to-r from-voya-orange to-voya-orange/70" />
            <span className="text-[10px] text-muted-foreground">Voya's AI share</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm border-2 border-dashed border-foreground/20 bg-foreground/[0.02]" />
            <span className="text-[10px] text-muted-foreground">Fair share target</span>
          </div>
        </div>
      </div>

      {/* ═══ SUPPORTING CONTEXT (subtle footer) ═══ */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <div className="flex items-center gap-4">
        </div>
        <span className="text-muted-foreground/60">
          Tracking {totalPrompts} prompts
        </span>
      </div>
    </div>
  );
}
