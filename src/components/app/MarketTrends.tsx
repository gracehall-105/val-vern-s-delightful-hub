// @ts-nocheck — direct port from VS Code; tighten types incrementally
import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Sparkles, Clock, BarChart3, LineChart } from 'lucide-react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { API_BASE } from '@/lib/api';
import {
  useTrend, useShares, useCompanies, usePrompts, useStatus, useSources, useRecommendations,
} from '@/lib/queries';
import { SYNTHETIC_TREND } from '@/lib/synthetic-trend';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler, Tooltip, Legend);

// Voya is always orange; competitors keep a fixed color across all views/time
const VOYA_COLOR = '#ff570c';

// Fixed color assignments — known brands always get their recognizable color
const COMPANY_COLORS: Record<string, string> = {
  'Voya': VOYA_COLOR,
  'Fidelity': '#60a5fa',
  'Vanguard': '#4ade80',
  'Schwab': '#fbbf24',
  'Betterment': '#a78bfa',
  'Wealthfront': '#34d399',
  'E*TRADE': '#f472b6',
  'TD Ameritrade': '#94a3b8',
  'Empower': '#67e8f9',
  'TIAA': '#a3e635',
  'NerdWallet': '#e879f9',
  'Merrill Edge': '#fb923c',
  'Edward Jones': '#fca5a5',
  'Principal': '#7dd3fc',
  'Equity Trust': '#d4d4d8',
  'Rocket Dollar': '#f59e0b',
  'Aflac': '#38bdf8',
  'Colonial Life': '#c084fc',
  'Mutual of Omaha': '#2dd4bf',
  'MetLife': '#818cf8',
  'Unum': '#fb7185',
  'Guardian': '#a3e635',
  'Prudential': '#facc15',
  'Lincoln Financial': '#f97316',
  'Cigna': '#22d3ee',
  'Aetna': '#d946ef',
  'Humana': '#4ade80',
  'UnitedHealthcare': '#60a5fa',
  'Hartford': '#f472b6',
  'Allstate': '#fbbf24',
  'State Farm': '#ef4444',
  'Nationwide': '#3b82f6',
};

function hashStringToHue(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  return ((Math.abs(hash) * 137.508) % 360);
}

function getCompanyColor(company: string): string {
  if (COMPANY_COLORS[company]) return COMPANY_COLORS[company];
  const hue = hashStringToHue(company);
  return `hsl(${Math.round(hue)}, 70%, 60%)`;
}

const categoryLabels: Record<string, string> = {
  'Advisors': 'Advisors',
  'Benefits': 'Benefits',
  'Brand': 'Brand',
  'Disability': 'Disability',
  'HSA': 'HSA',
  'Planning': 'Planning',
  'Providers': 'Providers',
  'Retirement Plan Services': 'Retirement Plan Services',
  'Rollover': 'Rollover',
  'Supplemental Health': 'Supplemental Health',
  'Technology': 'Technology',
  'Wealth Management': 'Wealth Management',
};

// Build dynamic filter description for chart subtitle
function buildFilterDescription(
  selectedBranding: string,
  selectedPrompt: string,
  selectedAudience: string,
  selectedSinglePrompt: string | null,
  visiblePrompts: any[],
  trackedPrompts: any[]
): string {
  // Single prompt mode
  if (selectedSinglePrompt) {
    const promptText = visiblePrompts.find(p => p.id === selectedSinglePrompt)?.prompt || 
                      trackedPrompts.find(p => p.id === selectedSinglePrompt)?.prompt || 
                      selectedSinglePrompt;
    return `Analyzing: "${promptText}"`;
  }

  const parts: string[] = [];

  // Branding part
  if (selectedBranding === 'all') {
    parts.push('All prompts');
  } else if (selectedBranding === 'branded') {
    parts.push('Branded prompts');
  } else if (selectedBranding === 'unbranded') {
    parts.push('Unbranded prompts');
  }

  // Category part
  if (selectedPrompt !== 'all' && selectedPrompt !== 'Brand') {
    const catLabel = categoryLabels[selectedPrompt] || selectedPrompt;
    parts.push(`in ${catLabel} category`);
  } else if (selectedPrompt === 'Brand') {
    parts.push('in Brand category');
  } else {
    parts.push('across all categories');
  }

  // Audience part
  if (selectedAudience === 'all') {
    parts.push('all audiences');
  } else {
    parts.push(`${selectedAudience} audience`);
  }

  return `Showing: ${parts.join(' ')}`;
}

interface PromptSource {
  source_name: string;
  source_type: string;
  citations: number;
}

const CURATED_COMPANIES = new Set([
  'Voya', 'Fidelity', 'Schwab', 'Vanguard', 'Empower', 'TIAA', 'Principal', 'Prudential',
]);

function generateInsight(shares: Record<string, number>, promptLabel?: string): { action: string; context: string; severity: 'critical' | 'warning' | 'positive' } {
  const sorted = Object.entries(shares).sort((a, b) => b[1] - a[1]);
  const leader = sorted[0];
  const voyaPct = shares['Voya'] || 0;
  const leaderName = leader?.[0] || 'competitor';
  const leaderPct = Math.round(leader?.[1] || 0);

  if (voyaPct < 3) {
    return {
      action: `Publish Entity-Grounding Content to Get Voya Into AI Citations Against ${leaderName}`,
      context: `${leaderName} leads at ${leaderPct}%${promptLabel ? ` on "${promptLabel}"` : ''}.`,
      severity: 'warning' as const,
    };
  }
  return {
    action: `Create Comparison + Decision-Tree Content to Close the Gap with ${leaderName}`,
    context: `${leaderName} leads at ${leaderPct}%${promptLabel ? ` on "${promptLabel}"` : ''}.`,
    severity: 'warning' as const,
  };
}

interface MarketTrendsProps {
  onNavigateToContent?: (topic?: string, articleType?: string, rationale?: string, contentId?: number, targetGap?: string) => void;
}

export default function MarketTrends({ onNavigateToContent }: MarketTrendsProps) {
  const [selectedBranding, setSelectedBranding] = useState<'all' | 'branded' | 'unbranded'>('all');
  const [selectedAudience, setSelectedAudience] = useState('all');
  const [selectedWeeks, setSelectedWeeks] = useState(4);
  const [selectedPrompt, setSelectedPrompt] = useState('all');
  const [selectedSinglePrompt, setSelectedSinglePrompt] = useState<string | null>(null);
  const [hoveredCompany, setHoveredCompany] = useState<string | null>(null);
  const [expandedCompany, setExpandedCompany] = useState<string | null>(null);
  const [expandedLeadLists, setExpandedLeadLists] = useState<Record<string, boolean>>({});
  const [companySearch, setCompanySearch] = useState('');
  const [promptSearch, setPromptSearch] = useState('');
  const chartRef = useRef<any>(null);
  const hasInteractedRef = useRef(false);
  const [chartMode, setChartMode] = useState<'bar' | 'line'>('bar');
  const [pillsExpanded, setPillsExpanded] = useState(false);
  const [categoryContent, setCategoryContent] = useState<any>(null);

  // Shared react-query hooks — cached & deduplicated across views
  // Trend query filters by category/prompt to show real per-selection week-over-week data
  // Brand pill only filters which prompt pills are visible — it does NOT change the API branding
  // param so the existing shares query (and its cached data) remains valid.
  const trendBranding = selectedBranding !== 'all' ? selectedBranding : undefined;
  const trendCategory = selectedPrompt !== 'all' ? selectedPrompt : undefined;
  const trendAudience = selectedAudience !== 'all' ? selectedAudience : undefined;
  const trendPromptId = selectedSinglePrompt || undefined;
  const trendQ = useTrend(selectedWeeks, trendCategory, trendPromptId, trendBranding, trendAudience);
  // Aggregated trend (unfiltered) to discover total available weeks and stable ordering
  const maxWeeksQ = useTrend(12, undefined, undefined, undefined, undefined);
  const sharesQ = useShares(trendBranding, trendAudience);
  const companiesQ = useCompanies(trendBranding, trendAudience);
  const promptsQ = usePrompts();
  const statusQ = useStatus();
  const sourcesQ = useSources(30);
  const recsQ = useRecommendations();

  const apiTrend = trendQ.data?.trend || [];
  const usingSynthetic = apiTrend.length === 0;
  const trendData = usingSynthetic ? SYNTHETIC_TREND.slice(-selectedWeeks) : apiTrend;
  const companies = companiesQ.data?.companies || [];
  const allTrackedPrompts = promptsQ.data || [];
  // Filtering logic for prompt display:
  // - Custom prompts (id starts with "custom-") are always shown
  // - When branding is explicitly chosen: filter to that branding only (branded/unbranded)
  // - When brand category is selected: show all branded prompts (regardless of category)
  // - Default (All, All): show ALL tracked prompts (both branded and unbranded) = 348 prompts
  const trackedPrompts = useMemo(() => allTrackedPrompts.filter(p => {
    if (p.id.startsWith('custom-')) return true;
    // When the user has explicitly chosen a branding filter, respect it directly
    // so branded prompts in non-brand categories (e.g. p9 in "retirement") still appear.
    if (selectedBranding !== 'all') return p.branding === selectedBranding;
    // Brand pill selected: show all branded prompts regardless of their category.
    if (selectedPrompt === 'Brand') return p.branding === 'branded';
    // Default (All, All): show ALL tracked prompts (167 branded + 181 unbranded = 348 total)
    return true;
  }), [allTrackedPrompts, selectedBranding, selectedPrompt]);
  const sourceSummaries = sourcesQ.data?.sources || [];
  // Backend is optional — SYNTHETIC_TREND provides a demo fallback so the
  // view always renders. Never block on the trend queries themselves.
  const loading = false;

  const availableWeeks = useMemo(() => {
    const apiCount = maxWeeksQ.data?.trend.length || 0;
    const count = apiCount > 0 ? apiCount : SYNTHETIC_TREND.length;
    if (count === 0) return [];
    const weeks = [];
    const limit = Math.min(count, 12);
    for (let i = 1; i <= limit; i++) {
      weeks.push(i);
    }
    return weeks;
  }, [maxWeeksQ.data]);

  // Set default weeks to max available (clamped to 4 once we have enough data).
  // Only runs before the user has manually chosen a range.
  useEffect(() => {
    if (!hasInteractedRef.current && maxWeeksQ.data?.trend.length) {
      const count = maxWeeksQ.data.trend.length;
      setSelectedWeeks(count <= 5 ? count : 4);
    }
  }, [maxWeeksQ.data]);

  const orchestratorResult = recsQ.data?.recommendations?.length
    ? { recommendations: recsQ.data.recommendations, cycle_id: recsQ.data.cycle_id, total: recsQ.data.total }
    : null;
  const measuringNow = !!statusQ.data?.measuring;
  const allowGlobalRecommendations = selectedBranding === 'all' && selectedAudience === 'all';

  const [sourcesByPrompt, setSourcesByPrompt] = useState<Record<string, PromptSource[]>>({});
  const sourcesByPromptLoaded = useRef(false);
  const [companyPrompts, setCompanyPrompts] = useState<Record<string, { prompt_id: string; prompt: string; share_pct: number }[]>>({});

  // Clear companyPrompts cache whenever the active filters change so stale
  // per-filter results are never shown for a previously-expanded company.
  useEffect(() => { setCompanyPrompts({}); }, [trendBranding, trendAudience]);

  const perPromptShares = useMemo(() => {
    const map: Record<string, Record<string, number>> = {};
    for (const item of (sharesQ.data?.shares || [])) {
      map[item.prompt_id] = item.shares;
    }
    return map;
  }, [sharesQ.data]);

  // Derived computations
  // Only filter to prompts-with-data once shares have loaded and we're not in a cold-start state.
  // During loading or cold-start, show all tracked prompts so the UI isn't empty.
  const sharesLoaded = !sharesQ.isLoading && sharesQ.isSuccess;
  const coldStart = sharesQ.data?.cold_start ?? true;
  const promptsWithData = useMemo(() => {
    if (!sharesLoaded || coldStart) return trackedPrompts;
    return trackedPrompts.filter(p => p.id in perPromptShares);
  }, [trackedPrompts, perPromptShares, sharesLoaded, coldStart, selectedPrompt]);

  const brandingFilteredPrompts = useMemo(() => {
    // The Questions (Branded/Unbranded) control flows through to the API queries
    // (useTrend/useShares/useCompanies) — it should NOT also filter the prompt pill
    // list by prompt metadata, which would empty the list when "Branded" is selected
    // since most prompts are unbranded.
    let list = promptsWithData;
    if (selectedAudience !== 'all') {
      list = list.filter(p => p.audience === selectedAudience);
    }
    return list;
  }, [selectedAudience, promptsWithData]);

  const promptAudiences = useMemo(() => {
    const auds = new Set<string>();
    promptsWithData.forEach(p => { if (p.audience) auds.add(p.audience); });
    return Array.from(auds).sort();
  }, [promptsWithData]);

  const promptCategories = useMemo(() => {
    const cats = new Map<string, number>();
    brandingFilteredPrompts.forEach(p => cats.set(p.category, (cats.get(p.category) || 0) + 1));
    return cats;
  }, [brandingFilteredPrompts]);

  const visiblePrompts = useMemo(() => {
    if (selectedPrompt === 'all') return brandingFilteredPrompts;
    // Brand pill: show all branded prompts regardless of their category (e.g. p9 "Is Voya a good
    // retirement company" has category=retirement but branding=branded).
    if (selectedPrompt === 'Brand') return brandingFilteredPrompts.filter(p => p.branding === 'branded');
    return brandingFilteredPrompts.filter(p => p.category === selectedPrompt);
  }, [selectedPrompt, brandingFilteredPrompts]);

  const activeShares = useMemo((): Record<string, number> => {
    if (selectedSinglePrompt && perPromptShares[selectedSinglePrompt]) {
      return perPromptShares[selectedSinglePrompt];
    }
    // When a category is selected, aggregate only that category's prompts
    if (selectedPrompt !== 'all') {
      const catPromptIds = new Set(visiblePrompts.map(p => p.id));
      const totals: Record<string, number> = {};
      let count = 0;
      for (const id of catPromptIds) {
        const shares = perPromptShares[id];
        if (!shares) continue;
        count++;
        for (const [company, pct] of Object.entries(shares)) {
          totals[company] = (totals[company] || 0) + pct;
        }
      }
      if (count > 0) {
        return Object.fromEntries(
          Object.entries(totals).map(([k, v]) => [k, Math.round(v / count)])
        );
      }
    }
    if (trendData.length > 0) {
      const lastWeek = trendData[trendData.length - 1];
      return Object.fromEntries(
        Object.entries(lastWeek.shares).map(([k, v]) => [k, Math.round(v)])
      );
    }
    const fallback: Record<string, number> = {};
    companies.forEach(c => { fallback[c.company] = c.share_pct; });
    return Object.keys(fallback).length > 0 ? fallback : {};
  }, [selectedSinglePrompt, perPromptShares, trendData, companies, selectedPrompt, visiblePrompts]);

  const lastWeekLabel = useMemo(() => {
    if (trendData.length === 0) return '';
    const lastWeek = trendData[trendData.length - 1];
    const d = new Date(lastWeek.date + 'T00:00:00');
    const dayOfWeek = d.getDay();
    const saturday = new Date(d);
    saturday.setDate(d.getDate() - dayOfWeek + 6);
    return saturday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }, [trendData]);

  const filteredTrend = useMemo(() => {
    if (trendData.length > 0) {
      return trendData.map((w) => {
        const d = new Date(w.date + 'T00:00:00');
        const dayOfWeek = d.getDay();
        const sunday = new Date(d);
        sunday.setDate(d.getDate() - dayOfWeek);
        const saturday = new Date(sunday);
        saturday.setDate(sunday.getDate() + 6);
        const startMonth = sunday.toLocaleDateString('en-US', { month: 'short' });
        const startDay = sunday.getDate();
        const endDay = saturday.getDate();
        const endMonth = saturday.toLocaleDateString('en-US', { month: 'short' });
        let label = startMonth === endMonth
          ? `${startMonth} ${startDay} - ${endDay}`
          : `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
        return { date: w.date, week: label, shares: w.shares, prompt_count: w.prompt_count, missing: (w as any).missing === true };
      });
    }
    return [];
  }, [trendData]);

  const selectedPromptLabel = selectedSinglePrompt
    ? trackedPrompts.find(p => p.id === selectedSinglePrompt)?.prompt
    : undefined;

  const selectedCategoryLabel = selectedPrompt !== 'all'
    ? `${categoryLabels[selectedPrompt] || selectedPrompt} prompts`
    : undefined;

  const insight = useMemo(() => {
    // When a specific category is selected, show the pre-written content title (if available)
    // so the header matches what "Review & Publish" will open.
    if (selectedPrompt !== 'all' && !selectedSinglePrompt) {
      if (categoryContent?.topic) {
        // Find matching recommendation for headline and rationale
        const catRec = orchestratorResult?.recommendations?.find(
          (r: any) => r.content_id === categoryContent.id
        );
        return {
          action: catRec?.headline || categoryContent.topic,
          context: catRec?.rationale || `Ready to review · ${categoryLabels[selectedPrompt] || selectedPrompt}`,
          severity: 'warning' as const,
        };
      }
      return generateInsight(activeShares, selectedCategoryLabel);
    }
    const topRec = allowGlobalRecommendations ? orchestratorResult?.recommendations?.[0] : null;
    if (topRec) {
      return {
        action: topRec.headline || topRec.topic,
        context: topRec.rationale || `${topRec.rec_type} · ${topRec.priority} priority`,
        severity: topRec.priority === 'critical' ? 'critical' as const : 'warning' as const,
      };
    }
    return generateInsight(activeShares, selectedPromptLabel);
  }, [allowGlobalRecommendations, orchestratorResult, activeShares, selectedPromptLabel, selectedCategoryLabel, selectedPrompt, selectedSinglePrompt, categoryContent]);

  const contentTopic = useMemo(() => {
    // When pre-written content is available (any category including "all" via orchestrator), use its topic
    if (categoryContent?.topic) return categoryContent.topic;
    const topRec = allowGlobalRecommendations ? orchestratorResult?.recommendations?.[0] : null;
    if (topRec?.topic) return topRec.topic;
    if (selectedPromptLabel) return selectedPromptLabel;
    const zeroPrompt = trackedPrompts.find(p => (perPromptShares[p.id]?.['Voya'] || 0) === 0);
    return zeroPrompt?.prompt || trackedPrompts[0]?.prompt || 'Retirement planning';
  }, [allowGlobalRecommendations, orchestratorResult, selectedPromptLabel, trackedPrompts, perPromptShares, categoryContent, selectedPrompt]);

  // Stable company order: sorted by the global "all prompts" trend (last week).
  // This prevents chart datasets from reordering on category/prompt switches (no shaking).
  const aggTrendData = maxWeeksQ.data?.trend || [];
  const globalShares = useMemo(() => {
    if (aggTrendData.length > 0) {
      const lastWeek = aggTrendData[aggTrendData.length - 1];
      return Object.fromEntries(
        Object.entries(lastWeek.shares).map(([k, v]) => [k, Math.round(v)])
      );
    }
    const fallback: Record<string, number> = {};
    companies.forEach(c => { fallback[c.company] = c.share_pct; });
    return fallback;
  }, [aggTrendData, companies]);

  const companiesOrdered = useMemo(() => {
    const allCompanies = new Set<string>();
    for (const w of filteredTrend) {
      for (const k of Object.keys(w.shares)) if (k !== 'Others') allCompanies.add(k);
    }
    for (const k of Object.keys(activeShares)) if (k !== 'Others') allCompanies.add(k);
    return [...allCompanies].sort((a, b) => (globalShares[b] || 0) - (globalShares[a] || 0) || a.localeCompare(b));
  }, [filteredTrend, activeShares, globalShares]);

  const handlePromptClick = useCallback((promptId: string) => {
    setSelectedSinglePrompt(prev => prev === promptId ? null : promptId);
  }, []);

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedPrompt(category);
    setSelectedSinglePrompt(null);
    setPillsExpanded(false);
  }, []);

  const handleBrandingChange = useCallback((branding: 'all' | 'branded' | 'unbranded') => {
    setSelectedBranding(branding);
    setSelectedPrompt('all');
    setSelectedSinglePrompt(null);
    setPillsExpanded(false);
  }, []);

  const handleAudienceChange = useCallback((audience: string) => {
    setSelectedAudience(audience);
    setSelectedPrompt('all');
    setSelectedSinglePrompt(null);
    setPillsExpanded(false);
  }, []);

  // Fetch pre-written content for selected category (or top recommendation's category when "All")
  useEffect(() => {
    const rawCategory = selectedPrompt !== 'all'
      ? selectedPrompt
      : (allowGlobalRecommendations ? orchestratorResult?.recommendations?.[0]?.category : undefined);
    const effectiveCategory = rawCategory?.toLowerCase();

    if (!effectiveCategory) { setCategoryContent(null); return; }
    let cancelled = false;
    fetch(`${API_BASE}/content/for-category?category=${effectiveCategory}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (!cancelled && data?.found) setCategoryContent(data.item); else if (!cancelled) setCategoryContent(null); })
      .catch(() => { if (!cancelled) setCategoryContent(null); });
    return () => { cancelled = true; };
  }, [allowGlobalRecommendations, selectedPrompt, orchestratorResult]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm gap-2">
        <Clock className="w-4 h-4 animate-spin" /> Loading market trends…
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-slide-in">
      <div className="rounded-2xl bg-card border border-border shadow-card p-8 min-w-0">
        {/* Header — Action first, context second */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                  insight.severity === 'critical' ? 'bg-red-500' :
                  insight.severity === 'positive' ? 'bg-emerald-500' :
                  'bg-voya-orange'
                }`} />
                <h3 className="font-display text-2xl font-bold text-foreground leading-snug">{insight.action}</h3>
              </div>
              <p className="text-sm text-foreground/70 ml-6 mt-1">{insight.context}</p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              {measuringNow && (
                <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-300 rounded text-[9px] animate-pulse">Measuring…</span>
              )}
              <button
                onClick={() => {
                  const topRec = allowGlobalRecommendations ? orchestratorResult?.recommendations?.[0] : null;
                  const cid = selectedPrompt !== 'all'
                    ? categoryContent?.id
                    : (topRec?.content_id || categoryContent?.id);
                  onNavigateToContent?.(contentTopic, 'guide', insight.context, cid, topRec?.target_gap);
                }}
                disabled={!categoryContent && !(allowGlobalRecommendations && orchestratorResult?.recommendations?.[0])}
                className={`rounded-full bg-gradient-voya text-white font-medium shadow-soft text-[11px] px-3 py-1.5 flex items-center gap-1.5 whitespace-nowrap ${(!categoryContent && !(allowGlobalRecommendations && orchestratorResult?.recommendations?.[0])) ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <Sparkles size={11} />
                Review &amp; Edit
              </button>
            </div>
          </div>
        </div>

        {/* Controls Row — three labeled filter groups: Questions, Audience, Category */}
        <div className="space-y-2.5 mb-6">

          {/* Questions (Branded / Unbranded) */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50 w-20 shrink-0">Questions</span>
            <div role="group" aria-label="Question type filter" className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                aria-pressed={selectedBranding === 'all'}
                onClick={() => handleBrandingChange('all')}
                className={`text-[11px] px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  selectedBranding === 'all'
                    ? 'bg-voya-orange text-white shadow-sm'
                    : 'bg-foreground/[0.04] text-muted-foreground hover:bg-foreground/[0.08] border border-border'
                }`}
              >
                All
              </button>
              <button
                type="button"
                aria-pressed={selectedBranding === 'branded'}
                onClick={() => handleBrandingChange('branded')}
                className={`text-[11px] px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  selectedBranding === 'branded'
                    ? 'bg-voya-orange text-white shadow-sm'
                    : 'bg-foreground/[0.04] text-muted-foreground hover:bg-foreground/[0.08] border border-border'
                }`}
              >
                Branded
              </button>
              <button
                type="button"
                aria-pressed={selectedBranding === 'unbranded'}
                onClick={() => handleBrandingChange('unbranded')}
                className={`text-[11px] px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  selectedBranding === 'unbranded'
                    ? 'bg-voya-orange text-white shadow-sm'
                    : 'bg-foreground/[0.04] text-muted-foreground hover:bg-foreground/[0.08] border border-border'
                }`}
              >
                Unbranded
              </button>
            </div>
          </div>

          <div className="h-px bg-border/40" />

          {/* Audience */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50 w-20 shrink-0">Audience</span>
            <div role="group" aria-label="Audience filter" className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                aria-pressed={selectedAudience === 'all'}
                onClick={() => handleAudienceChange('all')}
                className={`text-[11px] px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  selectedAudience === 'all'
                    ? 'bg-voya-orange text-white shadow-sm'
                    : 'bg-foreground/[0.04] text-muted-foreground hover:bg-foreground/[0.08] border border-border'
                }`}
              >
                All
              </button>
              {promptAudiences.map(aud => (
                <button
                  key={aud}
                  type="button"
                  aria-pressed={selectedAudience === aud}
                  onClick={() => handleAudienceChange(aud)}
                  className={`text-[11px] px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                    selectedAudience === aud
                      ? 'bg-voya-orange text-white shadow-sm'
                      : 'bg-foreground/[0.04] text-muted-foreground hover:bg-foreground/[0.08] border border-border'
                  }`}
                >
                  {aud}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-border/40" />

          {/* Category */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50 w-20 shrink-0">Category</span>
            <div role="group" aria-label="Category filter" className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                aria-pressed={selectedPrompt === 'all' && !selectedSinglePrompt}
                onClick={() => handleCategoryChange('all')}
                className={`text-[11px] px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  selectedPrompt === 'all' && !selectedSinglePrompt
                    ? 'bg-voya-orange text-white shadow-sm'
                    : 'bg-foreground/[0.04] text-muted-foreground hover:bg-foreground/[0.08] border border-border'
                }`}
              >
                All
              </button>
              {Array.from(promptCategories.entries()).map(([cat]) => (
                <button
                  key={cat}
                  type="button"
                  aria-pressed={selectedPrompt === cat && !selectedSinglePrompt}
                  onClick={() => handleCategoryChange(cat)}
                  className={`text-[11px] px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                    selectedPrompt === cat && !selectedSinglePrompt
                      ? 'bg-voya-orange text-white shadow-sm'
                      : 'bg-foreground/[0.04] text-muted-foreground hover:bg-foreground/[0.08] border border-border'
                  }`}
                >
                  {categoryLabels[cat] || cat}
                </button>
              ))}
              {!promptCategories.has('Brand') && (
                <button
                  type="button"
                  aria-pressed={selectedPrompt === 'Brand' && !selectedSinglePrompt}
                  onClick={() => handleCategoryChange('Brand')}
                  className={`text-[11px] px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                    selectedPrompt === 'Brand' && !selectedSinglePrompt
                      ? 'bg-voya-orange text-white shadow-sm'
                      : 'bg-foreground/[0.04] text-muted-foreground hover:bg-foreground/[0.08] border border-border'
                  }`}
                >
                  Brand
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Prompt Pills */}
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Prompt Pills</h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Search prompts…"
                value={promptSearch}
                onChange={e => setPromptSearch(e.target.value)}
                className="text-xs px-3 py-1.5 pr-7 rounded-lg border border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[hsl(var(--voya-orange))] w-44"
              />
              {promptSearch && (
                <button
                  type="button"
                  onClick={() => setPromptSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          <div className={`flex flex-wrap gap-2 pb-4 mb-2 overflow-hidden transition-all duration-300 ${pillsExpanded ? 'max-h-[2000px]' : 'max-h-[140px]'}`}>
            {visiblePrompts.filter(p => p.prompt.toLowerCase().includes(promptSearch.toLowerCase())).map(p => {
              const isActive = selectedSinglePrompt === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePromptClick(p.id)}
                  className={`text-[10px] px-3 py-1.5 rounded-full border transition-all whitespace-nowrap cursor-pointer ${
                    isActive 
                      ? 'bg-voya-orange/15 border-voya-orange text-voya-orange font-semibold shadow-sm' 
                      : 'bg-foreground/[0.04] border-border text-foreground/70 hover:border-voya-orange/50 hover:text-foreground'
                  }`}
                >
                  {p.prompt}
                </button>
              );
            })}
          </div>
          {visiblePrompts.length > 12 && (
            <button
              onClick={() => setPillsExpanded(!pillsExpanded)}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[11px] text-muted-foreground hover:text-foreground transition cursor-pointer mb-6"
            >
              <span>{pillsExpanded ? 'Show fewer' : `Show all ${visiblePrompts.length} prompts`}</span>
              <svg className={`w-3.5 h-3.5 transition-transform ${pillsExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>

        {/* Chart Section — Share of Model over time */}
        <div className="mt-2 mb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="font-display text-2xl font-bold text-foreground">Share of Model — Week over Week</h4>
            <div className="flex items-center gap-3">
              {availableWeeks.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-muted-foreground">Range:</span>
                  <div role="group" aria-label="Chart time range" className="flex items-center gap-1">
                    {[1, 2, 3, 4].filter(w => w <= availableWeeks.length).map(w => (
                      <button
                        key={w}
                        type="button"
                        aria-pressed={selectedWeeks === w}
                        onClick={() => { hasInteractedRef.current = true; setSelectedWeeks(w); }}
                        className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                          selectedWeeks === w
                            ? 'bg-voya-orange text-white shadow-sm'
                            : 'bg-foreground/[0.04] text-muted-foreground hover:bg-foreground/[0.08] border border-border'
                        }`}
                      >
                        {w}w
                      </button>
                    ))}
                    {availableWeeks.length > 4 && (
                      <button
                        type="button"
                        aria-pressed={selectedWeeks === availableWeeks[availableWeeks.length - 1]}
                        onClick={() => { hasInteractedRef.current = true; setSelectedWeeks(availableWeeks[availableWeeks.length - 1]); }}
                        className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                          selectedWeeks === availableWeeks[availableWeeks.length - 1]
                            ? 'bg-voya-orange text-white shadow-sm'
                            : 'bg-foreground/[0.04] text-muted-foreground hover:bg-foreground/[0.08] border border-border'
                        }`}
                      >
                        Max
                      </button>
                    )}
                  </div>
                </div>
              )}
              <div className="flex items-center rounded-lg border border-border bg-secondary/50 p-0.5" role="group" aria-label="Chart view mode">
              <button
                onClick={() => setChartMode('bar')}
                aria-pressed={chartMode === 'bar'}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-voya-orange ${
                  chartMode === 'bar' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <BarChart3 className="h-3 w-3" />
                Bar
              </button>
              <button
                onClick={() => setChartMode('line')}
                aria-pressed={chartMode === 'line'}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-voya-orange ${
                  chartMode === 'line' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <LineChart className="h-3 w-3" />
                Line
              </button>
            </div>
            </div>
          </div>
          <p className="text-sm text-foreground/70 mt-1">
            Normalized share of citations across curated competitors · Week ending {(() => {
              if (trendData.length > 0) {
                const last = trendData[trendData.length - 1];
                const d = new Date(last.date + 'T00:00:00');
                const day = d.getDay();
                const diff = (6 - day + 7) % 7;
                const sat = new Date(d);
                sat.setDate(d.getDate() + diff);
                return sat.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
              }
              return new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
            })()}
          </p>
          <p className="text-sm text-foreground/70 mt-1.5">
            {buildFilterDescription(selectedBranding, selectedPrompt, selectedAudience, selectedSinglePrompt, visiblePrompts, trackedPrompts)}
          </p>
          <p className="text-sm text-foreground/40 mt-1">
            Curated competitive set · Values normalized so each week sums to 100%
          </p>
        </div>

        {/* Missing-week banner */}
        {filteredTrend.some(w => (w as any).missing) && (
          <div className="mb-2 flex items-center justify-between gap-3 rounded-md border border-border bg-secondary/40 px-3 py-2 text-xs">
            <span className="text-foreground/80">
              Heads up — {filteredTrend.filter(w => (w as any).missing).length} week{filteredTrend.filter(w => (w as any).missing).length === 1 ? '' : 's'} in this range had no measurement run. The timeline is preserved and shown as a blank slot; week-over-week deltas that touch the gap are hidden.
            </span>
            <span className="flex items-center gap-1.5 shrink-0 text-muted-foreground">
              <span
                className="inline-block h-3 w-4 rounded-[2px] border border-border"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(45deg, hsl(var(--muted-foreground) / 0.35) 0 2px, transparent 2px 5px)',
                }}
                aria-hidden
              />
              Missing week
            </span>
          </div>
        )}

        {/* Chart */}
        <div className="h-[260px] relative">
          {filteredTrend.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
              No measurement data yet — chart will populate after the first scheduled run.
            </div>
          ) : (() => {
            const chartCompanies = companiesOrdered.filter(c =>
              CURATED_COMPANIES.has(c) && filteredTrend.some(w => (w.shares[c] || 0) > 0)
            );
            const weekTotals = filteredTrend.map(w =>
              chartCompanies.reduce((sum, c) => sum + (w.shares[c] || 0), 0)
            );
            // X-axis shows just the week; prompt-universe growth is rendered
            // as brackets under the axis + "+N" chips over expansion weeks.
            const labels = filteredTrend.map(w => {
              if ((w as any).missing) return `${w.week} (no data)`;
              return w.week;
            });
            const promptCounts: (number | null)[] = filteredTrend.map(w =>
              (w as any).missing ? null : (typeof w.prompt_count === 'number' ? w.prompt_count : null),
            );
            const missingFlags = filteredTrend.map(w => (w as any).missing === true);
            const normalizedData = (company: string) =>
              filteredTrend.map((w, i) => {
                if (missingFlags[i]) return NaN;
                return weekTotals[i] > 0 ? ((w.shares[company] || 0) / weekTotals[i]) * 100 : 0;
              });

            // Chart.js plugin: overlay a diagonal-hatch pattern on any column
            // where every dataset value is NaN. Reading from `chart.data` at
            // draw time keeps this stable across react-chartjs-2 re-renders
            // (a captured `missingFlags` closure would go stale on range change).
            const missingWeekOverlay = {
              id: 'missingWeekOverlay',
              afterDatasetsDraw(chart: any) {
                const { ctx, chartArea, scales, data } = chart;
                if (!chartArea || !scales?.x || !data?.datasets?.length) return;
                const labelList: string[] = data.labels || [];
                for (let i = 0; i < labelList.length; i++) {
                  const allNaN = data.datasets.every(
                    (ds: any) => ds?.data?.[i] == null || Number.isNaN(ds.data[i]),
                  );
                  if (!allNaN) continue;


                  const center = scales.x.getPixelForValue(i);
                  const bandWidth = (chartArea.right - chartArea.left) / labelList.length;
                  const w = Math.max(12, bandWidth * 0.55);
                  const x = center - w / 2;
                  const y = chartArea.top;
                  const h = chartArea.bottom - chartArea.top;

                  ctx.save();
                  ctx.fillStyle = 'rgba(148, 163, 184, 0.08)';
                  ctx.fillRect(x, y, w, h);
                  ctx.strokeStyle = 'rgba(148, 163, 184, 0.45)';
                  ctx.lineWidth = 1;
                  ctx.beginPath();
                  ctx.rect(x, y, w, h);
                  ctx.clip();
                  const step = 6;
                  for (let d = -h; d < w + h; d += step) {
                    ctx.beginPath();
                    ctx.moveTo(x + d, y);
                    ctx.lineTo(x + d + h, y + h);
                    ctx.stroke();
                  }
                  ctx.restore();

                  ctx.save();
                  ctx.fillStyle = 'rgba(148, 163, 184, 0.9)';
                  ctx.font = '10px system-ui, -apple-system, sans-serif';
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'middle';
                  ctx.translate(center, y + h / 2);
                  ctx.rotate(-Math.PI / 2);
                  ctx.fillText('No data collected', 0, 0);
                  ctx.restore();
                }
              },
            };

            const sharedOptions = {
              responsive: true,
              maintainAspectRatio: false,
              animation: { duration: 300 },
              interaction: { intersect: false, mode: 'index' as const },
              plugins: {
                legend: { display: false },
                tooltip: {
                  backgroundColor: 'rgba(22, 27, 34, 0.97)',
                  borderColor: 'rgba(255, 108, 0, 0.3)',
                  borderWidth: 1,
                  titleColor: '#e6edf3',
                  titleFont: { size: 13, weight: 'bold' as const },
                  bodyColor: '#8b949e',
                  bodyFont: { size: 12 },
                  cornerRadius: 10,
                  padding: 14,
                  filter: (tooltipItem: { dataset: { label?: string }; dataIndex: number }) => {
                    if (missingFlags[tooltipItem.dataIndex]) return false;
                    if (hoveredCompany) return tooltipItem.dataset.label === hoveredCompany;
                    return true;
                  },
                  callbacks: {
                    title: (items: { label?: string; dataIndex?: number }[]) => {
                      const idx = items[0]?.dataIndex ?? -1;
                      if (idx >= 0 && missingFlags[idx]) return `${items[0]?.label} — no data collected this week`;
                      if (hoveredCompany && items.length > 0) return `${hoveredCompany} — ${items[0]?.label}`;
                      return items[0]?.label || '';
                    },
                    label: (item: { parsed: { y: number | null }; dataset: { label?: string }; dataIndex: number }) => {
                      if (missingFlags[item.dataIndex]) return '  No measurement run this week';
                      if (hoveredCompany) return `  Share: ${Math.round(item.parsed.y ?? 0)}%`;
                      return `  ${item.dataset.label}: ${Math.round(item.parsed.y ?? 0)}%`;
                    },
                    afterBody: () => [],
                  },
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100,
                  stacked: true,
                  ticks: { callback: (v: string | number) => v + '%', color: '#8b949e', font: { size: 11 } },
                  grid: { color: 'rgba(255,255,255,0.04)' },
                  border: { display: false },
                },
                x: {
                  stacked: true,
                  grid: { color: 'rgba(255,255,255,0.03)' },
                  ticks: { color: '#8b949e', font: { size: 11 } },
                  border: { display: false },
                },
              },
            };

            if (chartMode === 'bar') {
              return (
                <Bar
                  ref={chartRef}
                  data={{
                    labels,
                    datasets: chartCompanies.map((company) => {
                      const color = getCompanyColor(company);
                      const isHovered = hoveredCompany === company;
                      const isDimmed = hoveredCompany !== null && !isHovered;
                      return {
                        label: company,
                        data: normalizedData(company),
                        backgroundColor: isDimmed ? color + '44' : color + 'CC',
                        borderColor: isDimmed ? color + '22' : color,
                        borderWidth: isHovered ? 2 : 1,
                        borderRadius: 2,
                      };
                    }),
                  }}
                  options={sharedOptions}
                  plugins={[missingWeekOverlay]}
                />
              );
            }

            return (
              <Line
                ref={chartRef}
                data={{
                  labels,
                  datasets: chartCompanies.map((company) => {
                    const color = getCompanyColor(company);
                    const isHovered = hoveredCompany === company;
                    const isDimmed = hoveredCompany !== null && !isHovered;
                    return {
                      label: company,
                      data: normalizedData(company),
                      borderColor: isDimmed ? color + '44' : color,
                      backgroundColor: isDimmed ? color + '22' : color + 'AA',
                      borderWidth: isHovered ? 3 : (company === 'Voya' ? 2.5 : 1.5),
                      pointRadius: isHovered ? 4 : (company === 'Voya' ? 3 : 0),
                      pointHoverRadius: 5,
                      pointBackgroundColor: color,
                      pointBorderColor: '#161b22',
                      pointBorderWidth: 1.5,
                      tension: 0.3,
                      fill: 'stack',
                      order: 1,
                      spanGaps: false,
                    };
                  }),
                }}
                options={sharedOptions}
                plugins={[missingWeekOverlay]}
              />
            );
          })()}
        </div>

        {/* Who AI is Citing — Full Competitive Leaderboard */}
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-display text-2xl font-bold text-foreground">Who AI is Citing{lastWeekLabel ? ` — Week Ending ${lastWeekLabel}` : ''}</h4>
            <div className="relative">
              <input
                type="text"
                placeholder="Search companies…"
                value={companySearch}
                onChange={e => setCompanySearch(e.target.value)}
                className="text-xs px-3 py-1.5 pr-7 rounded-lg border border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[hsl(var(--voya-orange))] w-44"
              />
              {companySearch && (
                <button
                  type="button"
                  onClick={() => setCompanySearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              )}
            </div>
          </div>
          <p className="text-sm text-foreground/70 mb-3">{selectedSinglePrompt
            ? `Share of model for "${visiblePrompts.find(p => p.id === selectedSinglePrompt)?.prompt || 'selected prompt'}"`
            : 'Full competitive landscape — every source AI models are citing across all tracked prompts'}</p>
          <div className="space-y-1.5">
            {companiesOrdered.filter(c => ((activeShares[c] || 0) > 0 || c === 'Voya') && (!companySearch || c.toLowerCase().includes(companySearch.toLowerCase()))).sort((a, b) => {
              const aCitationData = companies.find(co => co.company === a);
              const bCitationData = companies.find(co => co.company === b);
              const aCitations = aCitationData?.citations || 0;
              const bCitations = bCitationData?.citations || 0;
              if (a === 'Voya') return -1;
              if (b === 'Voya') return 1;
              return bCitations - aCitations;
            }).map(company => {
              const color = getCompanyColor(company);
              const citationData = companies.find(c => c.company === company);
              const citations = citationData?.citations || 0;
              const isVoya = company === 'Voya';
              const isActive = hoveredCompany === null || hoveredCompany === company;
              const isExpanded = expandedCompany === company;
              const leadsListExpanded = !!expandedLeadLists[company];

              const promptsWhereLeads: { prompt: string; promptId: string; share: number }[] = [];
              const promptsWhereVoyaAbsent: string[] = [];
              if (isExpanded) {
                // Primary: use per-prompt share data (companies with measurable share)
                for (const p of visiblePrompts) {
                  const shares = perPromptShares[p.id];
                  if (!shares) continue;
                  const companyShare = shares[company] || 0;
                  if (companyShare > 0) {
                    promptsWhereLeads.push({ prompt: p.prompt, promptId: p.id, share: companyShare });
                    if (!isVoya && (shares['Voya'] || 0) === 0) {
                      promptsWhereVoyaAbsent.push(p.prompt);
                    }
                  }
                }
                // Fallback: use the dedicated company-prompts endpoint for companies
                // whose per-prompt share rounds to 0 but they still have citations
                if (promptsWhereLeads.length === 0 && companyPrompts[company]) {
                  for (const p of companyPrompts[company]) {
                    promptsWhereLeads.push({ prompt: p.prompt, promptId: p.prompt_id, share: p.share_pct });
                  }
                }
                promptsWhereLeads.sort((a, b) => b.share - a.share);
              }

              const companySourceMap: Record<string, { name: string; type: string; count: number }> = {};
              for (const lead of promptsWhereLeads) {
                const promptSources = sourcesByPrompt[lead.promptId];
                if (promptSources) {
                  for (const src of promptSources) {
                    const key = `${src.source_name}::${src.source_type}`;
                    if (!companySourceMap[key]) {
                      companySourceMap[key] = { name: src.source_name, type: src.source_type, count: 0 };
                    }
                    companySourceMap[key].count += src.citations;
                  }
                }
              }
              const companyTopSources = Object.values(companySourceMap)
                .sort((a, b) => b.count - a.count)
                .slice(0, 4);
              const isGlobalSourceFallback = companyTopSources.length === 0 && sourceSummaries.length > 0;
              const topSourceOrigins = companyTopSources.length > 0
                ? companyTopSources.map(s => ({ source_name: s.name, source_type: s.type }))
                : sourceSummaries.slice(0, 4);

              const leadsToShow = leadsListExpanded ? promptsWhereLeads : promptsWhereLeads.slice(0, 3);
              const remainingLeads = Math.max(promptsWhereLeads.length - 3, 0);

              return (
                <div key={company}>
                  <button
                    onClick={() => {
                      setExpandedCompany(prev => {
                        const next = prev === company ? null : company;
                        if (next !== company) {
                          setExpandedLeadLists(prevLists => ({ ...prevLists, [company]: false }));
                        }
                        if (next && !sourcesByPromptLoaded.current) {
                          fetch(`${API_BASE}/som/sources/by-prompt?days=30`)
                            .then(r => { if (!r.ok) throw new Error(); return r.json(); })
                            .then(data => {
                              setSourcesByPrompt(data.by_prompt || {});
                              sourcesByPromptLoaded.current = true;
                            })
                            .catch(() => {});
                        }
                        if (next && !companyPrompts[company]) {
                          const cpFilters = trendBranding ? `&branding=${encodeURIComponent(trendBranding)}` : '';
                          const cpAudience = trendAudience ? `&audience=${encodeURIComponent(trendAudience)}` : '';
                          fetch(`${API_BASE}/som/companies/prompts?company=${encodeURIComponent(company)}${cpFilters}${cpAudience}`)
                            .then(r => { if (!r.ok) throw new Error(); return r.json(); })
                            .then(data => {
                              setCompanyPrompts(prev => ({ ...prev, [company]: data.prompts || [] }));
                            })
                            .catch(() => {});
                        }
                        return next;
                      });
                    }}
                    onMouseEnter={() => setHoveredCompany(company)}
                    onMouseLeave={() => setHoveredCompany(null)}
                    className={`w-full flex items-center gap-2 text-[11px] font-medium px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                      isActive ? 'opacity-100' : 'opacity-30'
                    } ${isExpanded ? 'bg-foreground/[0.08] ring-1 ring-white/10' : 'hover:bg-foreground/[0.04]'}`}
                  >
                    <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: color }} />
                    <span className="font-semibold min-w-[70px] text-left" style={{ color }}>{company}</span>
                    <div className="flex-1 h-1.5 bg-foreground/[0.06] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((citations / 100) * 100, 100)}%`, backgroundColor: color + (company === 'Voya' ? '' : '99') }}
                      />
                    </div>
                    <span className="text-[11px] tabular-nums min-w-[50px] text-right font-semibold" style={{ color: isActive ? color : '#8b949e' }}>
                      {citations}
                    </span>
                    <span className="text-[10px] text-muted-foreground min-w-[50px] text-right">
                      cite{citations !== 1 ? 's' : ''}
                    </span>
                  </button>

                  {/* Expanded detail — where they lead */}
                  {isExpanded && !isVoya && (
                    <div className="ml-7 mt-1 mb-2 pl-3 border-l-2 space-y-1" style={{ borderColor: color + '40' }}>
                      {promptsWhereLeads.length > 0 ? (
                        <>
                          <p className="text-[10px] text-muted-foreground font-medium">
                            Cited on {promptsWhereLeads.length} prompt{promptsWhereLeads.length !== 1 ? 's' : ''}
                            {promptsWhereVoyaAbsent.length > 0 && (
                              <span className="text-amber-400"> · Voya absent on {promptsWhereVoyaAbsent.length}</span>
                            )}
                          </p>
                          <p className="text-[10px] text-foreground/50">Prompts where cited:</p>
                          {leadsToShow.map((p, i) => (
                            <p key={i} className="text-[10px] text-foreground/60 truncate">
                              "{p.prompt}"{p.share > 0 && <span style={{ color }}> {Math.round(p.share)}%</span>}
                            </p>
                          ))}
                          {promptsWhereLeads.length > 3 && !leadsListExpanded && (
                            <button
                              type="button"
                              onClick={() => setExpandedLeadLists(prev => ({ ...prev, [company]: true }))}
                              className="text-[10px] text-muted-foreground hover:text-foreground/80 text-left"
                            >
                              +{remainingLeads} more
                            </button>
                          )}
                          {promptsWhereLeads.length > 3 && leadsListExpanded && (
                            <button
                              type="button"
                              onClick={() => setExpandedLeadLists(prev => ({ ...prev, [company]: false }))}
                              className="text-[10px] text-muted-foreground hover:text-foreground/80 text-left"
                            >
                              Show less
                            </button>
                          )}
                          {topSourceOrigins.length > 0 && (
                            <div className="pt-1">
                              <p className="text-[10px] text-foreground/50">{isGlobalSourceFallback ? 'Top sources overall:' : 'Where cited from (top sources):'}</p>
                              <p className="text-[10px] text-foreground/60">
                                {topSourceOrigins.map((s) => `${s.source_name} (${s.source_type})`).join(' · ')}
                              </p>
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="text-[10px] text-muted-foreground">
                          {citations} citation{citations !== 1 ? 's' : ''} across tracked prompts
                        </p>
                      )}
                    </div>
                  )}

                  {/* Voya expanded: show where we're winning */}
                  {isExpanded && isVoya && (
                    <div className="ml-7 mt-1 mb-2 pl-3 border-l-2 space-y-1" style={{ borderColor: VOYA_COLOR + '40' }}>
                      {promptsWhereLeads.length > 0 ? (
                        <>
                          <p className="text-[10px] text-emerald-400 font-medium">
                            Cited on {promptsWhereLeads.length} prompt{promptsWhereLeads.length !== 1 ? 's' : ''}
                          </p>
                          <p className="text-[10px] text-foreground/50">Prompts where cited:</p>
                          {leadsToShow.map((p, i) => (
                            <p key={i} className="text-[10px] text-foreground/60 truncate">
                              "{p.prompt}" <span className="text-voya-orange">{Math.round(p.share)}%</span>
                            </p>
                          ))}
                          {promptsWhereLeads.length > 3 && !leadsListExpanded && (
                            <button
                              type="button"
                              onClick={() => setExpandedLeadLists(prev => ({ ...prev, [company]: true }))}
                              className="text-[10px] text-muted-foreground hover:text-foreground/80 text-left"
                            >
                              +{remainingLeads} more
                            </button>
                          )}
                          {promptsWhereLeads.length > 3 && leadsListExpanded && (
                            <button
                              type="button"
                              onClick={() => setExpandedLeadLists(prev => ({ ...prev, [company]: false }))}
                              className="text-[10px] text-muted-foreground hover:text-foreground/80 text-left"
                            >
                              Show less
                            </button>
                          )}
                          {topSourceOrigins.length > 0 && (
                            <div className="pt-1">
                              <p className="text-[10px] text-foreground/50">{isGlobalSourceFallback ? 'Top sources overall:' : 'Where cited from (top sources):'}</p>
                              <p className="text-[10px] text-foreground/60">
                                {topSourceOrigins.map((s) => `${s.source_name} (${s.source_type})`).join(' · ')}
                              </p>
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="text-[10px] text-amber-400 font-medium">
                          Not leading on any prompts yet — content needed
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {/* Companies with 0 citations — collapsed count */}
          {(() => {
            const zeroCos = companiesOrdered.filter(c => (activeShares[c] || 0) === 0 && c !== 'Voya');
            if (zeroCos.length === 0) return null;
            return (
              <p className="text-[10px] text-muted-foreground mt-2 ml-1">
                +{zeroCos.length} tracked but not cited: {zeroCos.join(', ')}
              </p>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
