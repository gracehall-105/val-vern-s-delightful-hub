// @ts-nocheck — direct port from VS Code; tighten types incrementally
import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Eye, Zap, Rocket, Sparkles, Clock, Brain, BarChart3, LineChart } from 'lucide-react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { API_BASE } from '@/lib/api';
import CompetitiveContentCard from '@/components/app/CompetitiveContentCard';
import { useCompetitiveContent } from '@/lib/queries';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend);



// Voya is always orange; competitors keep a fixed color across all views/time
const VOYA_COLOR = '#ff570c';

// Fixed color assignments — each competitor always looks the same
const COMPANY_COLORS: Record<string, string> = {
  'Voya': VOYA_COLOR,
  'Fidelity': '#60a5fa',      // blue
  'Vanguard': '#4ade80',      // green
  'Schwab': '#fbbf24',        // amber
  'Betterment': '#a78bfa',    // purple
  'Wealthfront': '#34d399',   // teal
  'E*TRADE': '#f472b6',       // pink
  'TD Ameritrade': '#94a3b8', // slate
  'Empower': '#67e8f9',       // cyan
  'TIAA': '#a3e635',          // lime
  'NerdWallet': '#e879f9',    // fuchsia
  'Merrill Edge': '#fb923c',  // orange-light
  'Edward Jones': '#fca5a5',  // rose
  'Principal': '#7dd3fc',     // sky
  'Equity Trust': '#d4d4d8',  // gray
  'Rocket Dollar': '#f59e0b', // yellow
};
const COLOR_PALETTE = [
  '#60a5fa', '#4ade80', '#fbbf24', '#a78bfa', '#f472b6',
  '#34d399', '#94a3b8', '#67e8f9', '#e879f9', '#a3e635',
  '#fb923c', '#fca5a5', '#7dd3fc', '#d4d4d8',
];

function getCompanyColor(company: string, palette: Record<string, string>): string {
  if (COMPANY_COLORS[company]) return COMPANY_COLORS[company];
  if (palette[company]) return palette[company];
  // Assign next available color for unknown companies
  const usedColors = new Set([...Object.values(COMPANY_COLORS), ...Object.values(palette)]);
  const next = COLOR_PALETTE.find(c => !usedColors.has(c)) || '#8b949e';
  palette[company] = next;
  return next;
}

// Category labels for prompt chips
const categoryLabels: Record<string, string> = {
  rollover: 'Rollover',
  providers: 'Providers',
  advisors: 'Advisors',
  benefits: 'Benefits',
  reference: 'Reference',
  planning: 'Planning',
  brand: 'Brand',
};

interface WeeklyTrend {
  week: string;
  date: string;
  shares: Record<string, number>;
  days_measured?: number;
  prompt_count?: number;
  status?: string; // "full" | "partial" | "baseline"
}

// @ts-expect-error - reserved for future use
interface _PromptShareData {
  prompt_id: string;
  prompt: string;
  shares: Record<string, number>;
}

interface CompanyData {
  company: string;
  share_pct: number;
  citations: number;
  position: string;
}

interface TrackedPrompt {
  id: string;
  prompt: string;
  category: string;
}

interface SourceSummary {
  source_name: string;
  source_type: string;
  citations: number;
  prompts: number;
}

interface PromptSource {
  source_name: string;
  source_type: string;
  citations: number;
}

function generateInsight(shares: Record<string, number>, promptLabel?: string) {
  const sorted = Object.entries(shares)
    .sort((a, b) => b[1] - a[1]);
  const leader = sorted[0];
  const voyaPct = shares['Voya'] || 0;
  const leaderName = leader?.[0] || 'competitor';
  const leaderPct = Math.round(leader?.[1] || 0);

  if (voyaPct < 3) {
    return {
      action: `Publish Entity-Grounding Content to Get Voya Into AI Citations Against ${leaderName}`,
      context: `${leaderName} leads at ${leaderPct}%${promptLabel ? ` on "${promptLabel}"` : ''}.`,
      severity: 'critical' as const,
    };
  }

  // Voya is leading
  if (leaderName === 'Voya') {
    return {
      action: `Maintain Leadership by Publishing Timely, Category-Specific Content`,
      context: `Voya leads at ${leaderPct}%${promptLabel ? ` on "${promptLabel}"` : ''}.`,
      severity: 'positive' as const,
    };
  }

  return {
    action: `Create Comparison + Decision-Tree Content to Close the Gap with ${leaderName}`,
    context: `${leaderName} leads at ${leaderPct}%${promptLabel ? ` on "${promptLabel}"` : ''}.`,
    severity: 'warning' as const,
  };
}

interface CommandCenterProps {
  onNavigate?: (topic?: string, articleType?: string, rationale?: string, contentId?: number, targetGap?: string) => void;
  onViewChange?: (view: string) => void;
}

export function CommandCenter({ onNavigate, onViewChange: _onViewChange }: CommandCenterProps) {
  const { data: competitiveData, isLoading: competitiveLoading, error: competitiveError } = useCompetitiveContent();
  const [selectedPrompt, setSelectedPrompt] = useState('all');
  const [selectedSinglePrompt, setSelectedSinglePrompt] = useState<string | null>(null);
  const [hoveredCompany, setHoveredCompany] = useState<string | null>(null);
  const [expandedCompany, setExpandedCompany] = useState<string | null>(null);
  const [expandedLeadLists, setExpandedLeadLists] = useState<Record<string, boolean>>({});
  const [lastRefreshed, setLastRefreshed] = useState('Loading...');
  const chartRef = useRef<any>(null);
  const [chartMode, setChartMode] = useState<'bar' | 'line'>('bar');

  // Live data from API
  const [trendData, setTrendData] = useState<WeeklyTrend[]>([]);
  const [perPromptShares, setPerPromptShares] = useState<Record<string, Record<string, number>>>({});
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [sourceSummaries, setSourceSummaries] = useState<SourceSummary[]>([]);
  const [sourcesByPrompt, setSourcesByPrompt] = useState<Record<string, PromptSource[]>>({});
  const [trackedPrompts, setTrackedPrompts] = useState<TrackedPrompt[]>([]);
  const [, setLoading] = useState(true);
  const [, setConnected] = useState(false);
  const [, setAnalystSummary] = useState<string | null>(null);
  const [analystPeriod, setAnalystPeriod] = useState<string | null>(null);
  const [analystReport, setAnalystReport] = useState<any>(null);
  const [coldStart, setColdStart] = useState(false);
  const [backfillRunning, setBackfillRunning] = useState(false);
  const [backfillProgress, setBackfillProgress] = useState<{ completed: number; total: number; failed: number } | null>(null);
  const [pillsExpanded, setPillsExpanded] = useState(false);
  const [staleData, setStaleData] = useState(false);
  const [measuringNow, setMeasuringNow] = useState(false);
  const [, setCrawls] = useState<{ batch_id: string; started_at: string; ended_at: string; measurements: number; prompts: number; companies: number }[]>([]);

  // Track SoM for both unbranded and branded prompts
  const [voyaShareUnbranded, setVoyaShareUnbranded] = useState<any>(null);
  const [voyaShareBranded, setVoyaShareBranded] = useState<any>(null);

  // Fetch all live data from backend (unfiltered aggregate data)
  useEffect(() => {
    async function fetchData() {
      try {
        const [trendRes, sharesRes, companiesRes, companiesUnbrandedRes, companiesBrandedRes, promptsRes, statusRes, sourcesRes, sourcesByPromptRes] = await Promise.all([
          fetch(`${API_BASE}/som/trend?weeks=12&smooth=4`),
          fetch(`${API_BASE}/som/shares?_=1`),
          fetch(`${API_BASE}/som/companies?_=1`),
          fetch(`${API_BASE}/som/companies?_=1&branding=unbranded`),
          fetch(`${API_BASE}/som/companies?_=1&branding=branded`),
          fetch(`${API_BASE}/som/prompts`),
          fetch(`${API_BASE}/som/status`),
          fetch(`${API_BASE}/som/sources?days=30`),
          fetch(`${API_BASE}/som/sources/by-prompt?days=30`),
        ]);

        let anyColdStart = false;

        if (trendRes.ok) {
          const data = await trendRes.json();
          setTrendData(data.trend || []);
          if (data.cold_start) anyColdStart = true;
        }

        if (sharesRes.ok) {
          const data = await sharesRes.json();
          // Convert array to map keyed by prompt_id
          const map: Record<string, Record<string, number>> = {};
          for (const item of (data.shares || [])) {
            map[item.prompt_id] = item.shares;
          }
          setPerPromptShares(map);
        }

        if (companiesRes.ok) {
          const data = await companiesRes.json();
          setCompanies(data.companies || []);
          if (data.cold_start) anyColdStart = true;
        }

        // Extract Voya shares for branded/unbranded splits
        if (companiesUnbrandedRes.ok) {
          const data = await companiesUnbrandedRes.json();
          const voyaData = data.companies?.find((c: any) => c.company === 'Voya');
          setVoyaShareUnbranded(voyaData);
        }

        if (companiesBrandedRes.ok) {
          const data = await companiesBrandedRes.json();
          const voyaData = data.companies?.find((c: any) => c.company === 'Voya');
          setVoyaShareBranded(voyaData);
        }

        if (sourcesRes.ok) {
          const data = await sourcesRes.json();
          setSourceSummaries(data.sources || []);
        }

        if (sourcesByPromptRes.ok) {
          const data = await sourcesByPromptRes.json();
          setSourcesByPrompt(data.by_prompt || {});
        }

        setColdStart(anyColdStart);

        if (promptsRes.ok) {
          const data = await promptsRes.json();
          // Backend returns prompts from the sharemodel service
          const prompts = (data.prompts || []).map((p: any) => ({
            id: p.id || p.ID,
            prompt: p.prompt || p.text || p.Text,
            category: p.category || p.Category || '',
          }));
          setTrackedPrompts(prompts);
        }

        let measuring = false;
        if (statusRes.ok) {
          const data = await statusRes.json();
          setConnected(data.status === 'connected');
          setStaleData(!!data.stale);
          if (data.measuring) {
            measuring = true;
            setMeasuringNow(true);
            setLastRefreshed('Measuring...');
          } else {
            setMeasuringNow(false);
            if (data.last_measurement && !data.last_measurement.startsWith('0001')) {
              const d = new Date(data.last_measurement);
              setLastRefreshed(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
            } else if (data.total_measurements > 0) {
              setLastRefreshed('Just now');
            }
          }
        }
        return measuring;
      } catch (e) {
        console.error('Failed to fetch live data:', e);
        return false;
      } finally {
        setLoading(false);
      }
    }

    // Fetch stored analyst report (generated by Sunday morning run)
    async function fetchAnalystReport() {
      try {
        const res = await fetch(`${API_BASE}/intelligence/analyst-report`);
        if (res.ok) {
          const data = await res.json();
          if (data.report) {
            setAnalystSummary(data.report.overall_summary || null);
            setAnalystPeriod(data.report.period || null);
            setAnalystReport(data.report);
          }
        }
      } catch (e) {
        console.error('Failed to fetch analyst report:', e);
      }
    }

    // Initial fetch, then poll every 10s if measurement is still in progress
    let pollInterval: ReturnType<typeof setInterval> | null = null;
    fetchData().then((measuring) => {
      if (measuring) {
        pollInterval = setInterval(async () => {
          const still = await fetchData();
          if (!still && pollInterval) {
            clearInterval(pollInterval);
            pollInterval = null;
          }
        }, 10000);
      }
    });
    fetchAnalystReport();

    // Fetch crawl history
    fetch(`${API_BASE}/som/crawls`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.crawls) setCrawls(data.crawls); })
      .catch(() => {});

    // Check if a backfill is already running on load
    fetch(`${API_BASE}/som/backfill/status`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.running) {
          setBackfillRunning(true);
          setBackfillProgress({ completed: data.completed, total: data.total, failed: data.failed });
        }
      })
      .catch(() => {});

    return () => { if (pollInterval) clearInterval(pollInterval); };
  }, []);

  // Backfill trigger and progress polling
  const startBackfill = async () => {
    try {
      const res = await fetch(`${API_BASE}/som/backfill`, { method: 'POST' });
      if (res.ok) {
        setBackfillRunning(true);
        setBackfillProgress({ completed: 0, total: trackedPrompts.length || 157, failed: 0 });
      }
    } catch (e) {
      console.error('Failed to start backfill:', e);
    }
  };

  // Poll backfill progress
  useEffect(() => {
    if (!backfillRunning) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/som/backfill/status`);
        if (res.ok) {
          const data = await res.json();
          setBackfillProgress({ completed: data.completed, total: data.total, failed: data.failed });
          if (!data.running) {
            setBackfillRunning(false);
            setColdStart(false);
            // Re-fetch data now that backfill is complete
            window.location.reload();
          }
        }
      } catch (e) {
        console.error('Backfill poll error:', e);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [backfillRunning]);

  // Filter prompts by category
  const promptCategories = useMemo(() => {
    const cats = new Map<string, number>();
    trackedPrompts.forEach(p => cats.set(p.category, (cats.get(p.category) || 0) + 1));
    return cats;
  }, [trackedPrompts]);

  // Visible prompts based on category filter
  const visiblePrompts = useMemo(() => {
    if (selectedPrompt === 'all') return trackedPrompts;
    return trackedPrompts.filter(p => p.category === selectedPrompt);
  }, [selectedPrompt, trackedPrompts]);

  // Active share distribution — changes based on prompt selection
  const activeShares = useMemo((): Record<string, number> => {
    if (selectedSinglePrompt && perPromptShares[selectedSinglePrompt]) {
      return perPromptShares[selectedSinglePrompt];
    }
    // Aggregate across visible prompts
    const ids = visiblePrompts.map(p => p.id);
    const totals: Record<string, number> = {};
    let count = 0;
    for (const id of ids) {
      const shares = perPromptShares[id];
      if (!shares) continue;
      count++;
      for (const [company, pct] of Object.entries(shares)) {
        totals[company] = (totals[company] || 0) + pct;
      }
    }
    if (count === 0) {
      // Fallback to companies overview data
      const fallback: Record<string, number> = {};
      companies.forEach(c => { fallback[c.company] = c.share_pct; });
      return Object.keys(fallback).length > 0 ? fallback : {};
    }
    return Object.fromEntries(Object.entries(totals).map(([k, v]) => [k, Math.round(v / count)]));
  }, [selectedSinglePrompt, visiblePrompts, perPromptShares, companies]);

  // Use real trend data, or generate from active shares if single prompt selected
  const filteredTrend = useMemo(() => {
    if (selectedSinglePrompt && perPromptShares[selectedSinglePrompt]) {
      // Single prompt: generate synthetic trend from its shares (we only have one snapshot)
      const base = perPromptShares[selectedSinglePrompt];
      return Array.from({ length: Math.max(trendData.length, 1) }, (_, i) => ({
        week: `Wk ${i + 1}`,
        shares: Object.fromEntries(
          Object.entries(base).map(([company, pct]) => {
            const jitter = Math.sin(i * 1.7 + company.length) * 0.5;
            return [company, Math.max(0, Math.round(pct + jitter))];
          })
        ),
      }));
    }
    // Use real trend data from DB — label = "Mon D - D" range for each Sun–Sat week
    if (trendData.length > 0) {
      const now = new Date();
      return trendData.map((w, idx) => {
        const d = new Date(w.date + 'T00:00:00');
        // Find the Sunday (start) and Saturday (end) of the week
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

        // Add partial-week annotation
        if (w.status === 'partial' || (idx === trendData.length - 1 && saturday > now)) {
          const days = w.days_measured || 1;
          label += ` (${days}d)`;
        }
        if (w.prompt_count && w.prompt_count < 157) {
          label += ` [${w.prompt_count}p]`;
        }
        return { week: label, shares: w.shares };
      });
    }
    // No data yet — show empty
    return [];
  }, [selectedSinglePrompt, perPromptShares, trendData]);

  // Dynamic insight updates based on current selection
  const selectedPromptLabel = selectedSinglePrompt
    ? trackedPrompts.find(p => p.id === selectedSinglePrompt)?.prompt
    : undefined;
  const insight = useMemo(() => {
    return generateInsight(activeShares, selectedPromptLabel);
  }, [activeShares, selectedPromptLabel]);

  // Determine what topic to send to Content when "View Content" is clicked
  const contentTopic = useMemo(() => {
    if (selectedPromptLabel) return selectedPromptLabel;
    // Find the first prompt where Voya has 0% share
    const zeroPrompt = trackedPrompts.find(p => (perPromptShares[p.id]?.['Voya'] || 0) === 0);
    return zeroPrompt?.prompt || trackedPrompts[0]?.prompt || 'Retirement planning';
  }, [selectedPromptLabel, trackedPrompts, perPromptShares]);

  // Derive company list dynamically from all data sources (trend + activeShares)
  const [colorAssignments] = useState<Record<string, string>>({});
  const companiesOrdered = useMemo(() => {
    const allCompanies = new Set<string>();
    // From trend data
    for (const w of filteredTrend) {
      for (const k of Object.keys(w.shares)) if (k !== 'Others') allCompanies.add(k);
    }
    // From active shares
    for (const k of Object.keys(activeShares)) if (k !== 'Others') allCompanies.add(k);
    // Create map of company citations
    const citationMap: Record<string, number> = {};
    for (const c of companies) {
      citationMap[c.company] = c.citations || 0;
    }
    // Sort by citation count descending (Voya always first if present)
    const sorted = [...allCompanies]
      .sort((a, b) => {
        if (a === 'Voya') return -1;
        if (b === 'Voya') return 1;
        return (citationMap[b] || 0) - (citationMap[a] || 0);
      });
    // Assign colors
    for (const c of sorted) getCompanyColor(c, colorAssignments);
    return sorted;
  }, [filteredTrend, activeShares, companies, colorAssignments]);

  // Handle prompt pill click
  const handlePromptClick = useCallback((promptId: string) => {
    setSelectedSinglePrompt(prev => prev === promptId ? null : promptId);
  }, []);

  // Handle category change — reset single prompt selection
  const handleCategoryChange = useCallback((category: string) => {
    setSelectedPrompt(category);
    setSelectedSinglePrompt(null);
    setPillsExpanded(false);
  }, []);



  return (
    <div className="space-y-3 animate-slide-in">
      {/* Cold-start / backfill notice */}
      {(coldStart || backfillRunning) && (
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 px-4 py-3 flex items-center gap-3">
          <span className="text-amber-500 text-lg">{backfillRunning ? '🔄' : '⏳'}</span>
          <div className="flex-1">
            {backfillRunning && backfillProgress ? (
              <>
                <p className="text-sm font-medium text-amber-200">
                  Backfill in progress — {backfillProgress.completed}/{backfillProgress.total} prompts
                  {backfillProgress.failed > 0 && <span className="text-red-400"> ({backfillProgress.failed} failed)</span>}
                </p>
                <div className="mt-1.5 w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.round((backfillProgress.completed / Math.max(backfillProgress.total, 1)) * 100)}%` }}
                  />
                </div>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-amber-200">Awaiting first measurement cycle</p>
                <p className="text-xs text-amber-400/70">Run a backfill to measure all 365 prompts across 13 categories, or wait for the next scheduled run.</p>
              </>
            )}
          </div>
          {!backfillRunning && (
            <button
              onClick={startBackfill}
              className="shrink-0 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-medium px-3 py-1.5 hover:bg-amber-500/30 transition cursor-pointer"
            >
              Run Backfill
            </button>
          )}
        </div>
      )}

      {/* Hero KPI Cards — SoM by Branding Type */}
      <div className="grid grid-cols-4 gap-3 stagger-children">
        {/* SoM — Unbranded Prompts */}
        <div className="rounded-2xl bg-card border border-border shadow-card p-3 group relative">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-lg bg-foreground/[0.06] flex items-center justify-center">
              <Eye size={12} className="text-foreground/70" />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">SoM — Unbranded</span>
          </div>
          <p className="font-display text-2xl font-extrabold leading-none tracking-tight text-foreground">
            {Math.round(voyaShareUnbranded?.share_pct || 0)}%
          </p>
          <p className="text-[10px] text-muted-foreground mt-1.5 font-medium">Generic content (no brand mention)</p>
        </div>

        {/* SoM — Branded Prompts */}
        <div className="rounded-2xl bg-card border border-border shadow-card p-3 group relative">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-lg bg-foreground/[0.06] flex items-center justify-center">
              <Eye size={12} className="text-foreground/70" />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">SoM — Branded</span>
          </div>
          <p className="font-display text-2xl font-extrabold leading-none tracking-tight text-foreground">
            {Math.round(voyaShareBranded?.share_pct || 0)}%
          </p>
          <p className="text-[10px] text-muted-foreground mt-1.5 font-medium">Voya-specific content</p>
        </div>

        {/* Pipeline Velocity */}
        <div className="rounded-2xl bg-card border border-border shadow-card p-3 group relative">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-lg bg-foreground/[0.06] flex items-center justify-center">
              <Rocket size={12} className="text-foreground/70" />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Pipeline</span>
          </div>
          <p className="font-display text-2xl font-extrabold leading-none tracking-tight text-foreground">
            0
          </p>
          <p className="text-[10px] text-muted-foreground mt-1.5 font-medium">in-progress content pieces</p>
        </div>

        {/* Content Live */}
        <div className="rounded-2xl bg-card border border-border shadow-card p-3 group relative">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-lg bg-foreground/[0.06] flex items-center justify-center">
              <Zap size={12} className="text-foreground/70" />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Live Content</span>
          </div>
          <p className="font-display text-2xl font-extrabold leading-none tracking-tight text-foreground">
            0
          </p>
          <p className="text-[10px] text-muted-foreground mt-1.5 font-medium">published & boosting AI visibility</p>
        </div>
      </div>

      {/* Data Analyst Report — So What / Now What / Bottom Line */}
      {analystReport && (
        <div className="rounded-2xl bg-card border border-border shadow-card p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-6 h-6 rounded-lg bg-foreground/[0.06] flex items-center justify-center">
              <Brain size={12} className="text-foreground/70" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Data Analyst Report</h3>
            {analystPeriod && (
              <span className="text-[10px] text-muted-foreground">{analystPeriod}</span>
            )}
          </div>
          <div className="space-y-4">
            {/* So What */}
            <div className="flex gap-3">
              <div className="w-1 rounded-full bg-amber-400 shrink-0" />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-1">So What</p>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {analystReport.voya_trend === 'improving'
                    ? `Voya's share is growing — up ${Math.round(Math.abs(analystReport.voya_delta))}pp to ${Math.round(analystReport.voya_share_now)}% this period.`
                    : analystReport.voya_trend === 'declining'
                    ? `Voya's visibility is slipping — down ${Math.round(Math.abs(analystReport.voya_delta))}pp to ${Math.round(analystReport.voya_share_now)}% this period.`
                    : `Voya holds ${Math.round(analystReport.voya_share_now)}% of AI-generated answers across tracked prompts.`
                  }
                  {analystReport.competitor_moves?.filter((c: any) => c.trend === 'gaining').length > 0 && (
                    ` ${analystReport.competitor_moves.filter((c: any) => c.trend === 'gaining').map((c: any) => c.company).slice(0, 2).join(' and ')} ${analystReport.competitor_moves.filter((c: any) => c.trend === 'gaining').length === 1 ? 'is' : 'are'} gaining ground.`
                  )}
                </p>
              </div>
            </div>
            {/* Now What */}
            <div className="flex gap-3">
              <div className="w-1 rounded-full bg-sky-400 shrink-0" />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-sky-400 mb-1">Now What</p>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {analystReport.recommendations?.length > 0
                    ? analystReport.recommendations.slice(0, 2).map((r: any) => (r.rationale || `Create ${r.article_type} content on "${r.topic}"`).replace(/\.{2,}/g, '.').replace(/\.$/, '')).join('. ') + '.'
                    : analystReport.anomalies?.length > 0
                    ? `Investigate: ${analystReport.anomalies[0].description.replace(/\.{2,}/g, '.')}`
                    : 'Continue current content cadence and monitor next measurement cycle.'
                  }
                </p>
              </div>
            </div>
            {/* Bottom Line */}
            <div className="flex gap-3">
              <div className="w-1 rounded-full bg-emerald-400 shrink-0" />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 mb-1">Bottom Line</p>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {analystReport.voya_trend === 'first_week'
                    ? `Baseline established at ${Math.round(analystReport.voya_share_now)}% — next week we'll have trending data.`
                    : analystReport.voya_trend === 'improving'
                    ? `Momentum is positive. Keep publishing into gaps where competitors dominate.`
                    : analystReport.voya_trend === 'declining'
                    ? `Action needed — Voya is losing share and competitors are filling the space.`
                    : `Voya is holding steady. Target the highest-impact gaps to move the needle.`
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Actions — Primary Decision Point */}
      {analystReport && (
        <div className="rounded-2xl bg-gradient-to-r from-voya-orange/10 to-amber-500/10 border border-voya-orange/30 shadow-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-1">Ready to Act?</h3>
              <p className="text-xs text-foreground/70">Use the recommendations above to guide your next content moves</p>
            </div>
            <div className="flex items-center gap-2.5 flex-shrink-0">
              <button
                onClick={() => onNavigate?.('all', 'guide', 'Content recommendations based on latest insights')}
                className="rounded-full bg-gradient-voya text-white font-medium text-sm px-5 py-2.5 flex items-center gap-2 whitespace-nowrap cursor-pointer shadow-soft hover:shadow-md transition-all"
              >
                <Sparkles size={14} />
                View Content Recommendations
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Competitive Content Moves — Real-time signals */}
      <CompetitiveContentCard 
        signals={competitiveData?.signals || []} 
        loading={competitiveLoading}
        error={competitiveError?.message}
      />

      {/* Main content — Chart */}
      <div className="min-w-0">

      {/* Share of Model — 12 Week Trend [HIDDEN - moved to Market Trends] */}
      <div className="hidden rounded-2xl bg-card border border-border shadow-card p-8 min-w-0">
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
              <button
                onClick={() => onNavigate?.(contentTopic, 'guide', insight.context)}
                className="rounded-full bg-gradient-voya text-white font-medium shadow-soft text-[11px] px-3 py-1.5 flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <Sparkles size={11} />
                View Content
              </button>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                {measuringNow && (
                  <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-300 rounded text-[9px] animate-pulse">Measuring…</span>
                )}
                {staleData && !measuringNow && (
                  <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-300 rounded text-[9px]">⚠ Stale</span>
                )}
                <Clock size={11} />
                <span>{lastRefreshed}</span>
                <span className="px-1.5 py-0.5 bg-foreground/[0.05] rounded text-[9px]">4-wk avg</span>
              </div>
            </div>
          </div>
        </div>

        {/* Controls Row — Prompt Selector + Actions */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          {/* Category chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => handleCategoryChange('all')}
              className={`text-[11px] px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                selectedPrompt === 'all' && !selectedSinglePrompt
                  ? 'bg-voya-orange text-white shadow-sm' 
                  : 'bg-foreground/[0.04] text-muted-foreground hover:bg-foreground/[0.08] border border-border'
              }`}
            >
              All ({trackedPrompts.length})
            </button>
            {Array.from(promptCategories.entries()).map(([cat, count]) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`text-[11px] px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  selectedPrompt === cat && !selectedSinglePrompt
                    ? 'bg-voya-orange text-white shadow-sm' 
                    : 'bg-foreground/[0.04] text-muted-foreground hover:bg-foreground/[0.08] border border-border'
                }`}
              >
                {categoryLabels[cat] || cat} ({count})
              </button>
            ))}
          </div>


        </div>

        {/* Prompt Pills — wrapped grid showing individual prompts */}
        <div className="relative">
          <div className={`flex flex-wrap gap-2 pb-4 mb-2 overflow-hidden transition-all duration-300 ${pillsExpanded ? 'max-h-[2000px]' : 'max-h-[140px]'}`}>
            {visiblePrompts.map(p => {
              const isActive = selectedSinglePrompt === p.id;
              const promptVoya = perPromptShares[p.id]?.['Voya'] || 0;
              return (
                <button
                  key={p.id}
                  onClick={() => handlePromptClick(p.id)}
                  className={`text-[10px] px-3 py-1.5 rounded-full border transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    isActive 
                      ? 'bg-voya-orange/15 border-voya-orange text-voya-orange font-semibold shadow-sm' 
                      : 'bg-foreground/[0.04] border-border text-foreground/70 hover:border-voya-orange/50 hover:text-foreground'
                  }`}
                  title={`Voya's share for this prompt: ${Math.round(promptVoya)}%`}
                >
                  <span>{p.prompt}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                    promptVoya >= 10 ? 'bg-emerald-500/20 text-emerald-500' :
                    promptVoya >= 3 ? 'bg-voya-orange/20 text-voya-orange' :
                    'bg-red-500/20 text-red-500'
                  }`}>
                    {Math.round(promptVoya)}%
                  </span>
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
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-foreground">Share of Model — Week over Week</h4>
            <div className="flex items-center rounded-lg border border-border bg-secondary/50 p-0.5">
              <button
                onClick={() => setChartMode('bar')}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                  chartMode === 'bar' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <BarChart3 className="h-3 w-3" />
                Bar
              </button>
              <button
                onClick={() => setChartMode('line')}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                  chartMode === 'line' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <LineChart className="h-3 w-3" />
                Line
              </button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            % of AI-generated answers that cite each company · Week ending {(() => {
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
          <p className="text-xs text-foreground/70 mt-1.5">
            Showing: {selectedSinglePrompt
              ? <span className="text-voya-orange font-medium">"{visiblePrompts.find(p => p.id === selectedSinglePrompt)?.prompt || selectedSinglePrompt}"</span>
              : <span>{selectedPrompt === 'all' ? `All ${visiblePrompts.length} prompts (aggregated)` : `${visiblePrompts.length} ${selectedPrompt} prompts (aggregated)`}</span>
            }
          </p>
        </div>

        {/* Chart — Share of Model over time */}
        <div className="h-[200px] relative">
          {(() => {
            // Shared data computation for both chart modes
            const lastWeek = filteredTrend[filteredTrend.length - 1];
            const chartCompanies = companiesOrdered.filter(c => lastWeek && (lastWeek.shares[c] || 0) > 0);
            const weekTotals = filteredTrend.map(w =>
              chartCompanies.reduce((sum, c) => sum + (w.shares[c] || 0), 0)
            );
            const labels = filteredTrend.map(w => w.week);
            const normalizedData = (company: string) =>
              filteredTrend.map((w, i) => weekTotals[i] > 0 ? ((w.shares[company] || 0) / weekTotals[i]) * 100 : 0);

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
                  filter: (tooltipItem: any) => {
                    if (hoveredCompany) return tooltipItem.dataset.label === hoveredCompany;
                    return true;
                  },
                  callbacks: {
                    title: (items: any[]) => {
                      if (hoveredCompany && items.length > 0) return `${hoveredCompany} — ${items[0]?.label}`;
                      return items[0]?.label || '';
                    },
                    label: (item: any) => {
                      if (hoveredCompany) return `  Share: ${Math.round(item.parsed.y)}%`;
                      return `  ${item.dataset.label}: ${Math.round(item.parsed.y)}%`;
                    },
                    afterBody: () => [],
                  },
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100,
                  stacked: chartMode === 'bar',
                  ticks: { callback: (v: any) => v + '%', color: '#8b949e', font: { size: 11 } },
                  grid: { color: 'rgba(255,255,255,0.04)' },
                  border: { display: false },
                },
                x: {
                  stacked: chartMode === 'bar',
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
                      const color = getCompanyColor(company, colorAssignments);
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
                />
              );
            }

            return (
              <Line
                ref={chartRef}
                data={{
                  labels,
                  datasets: chartCompanies.map((company) => {
                    const color = getCompanyColor(company, colorAssignments);
                    const isHovered = hoveredCompany === company;
                    const isDimmed = hoveredCompany !== null && !isHovered;
                    return {
                      label: company,
                      data: normalizedData(company),
                      borderColor: isDimmed ? color + '66' : color,
                      backgroundColor: color + '18',
                      borderWidth: isHovered ? 3 : (company === 'Voya' ? 2.5 : 1.5),
                      pointRadius: isHovered ? 4 : (company === 'Voya' ? 3 : 0),
                      pointHoverRadius: 5,
                      pointBackgroundColor: color,
                      pointBorderColor: '#161b22',
                      pointBorderWidth: 1.5,
                      tension: 0.3,
                      fill: false,
                      order: company === 'Voya' ? 0 : 1,
                    };
                  }),
                }}
                options={sharedOptions}
              />
            );
          })()}
        </div>

        {/* Actuals Panel — who's surfacing, where, and what it means for Voya */}
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Who AI is citing — click to explore</p>
          </div>
          <div className="space-y-1.5">
            {companiesOrdered.filter(c => (activeShares[c] || 0) > 0 || c === 'Voya').map(company => {
              const color = getCompanyColor(company, colorAssignments);
              const citationData = companies.find(c => c.company === company);
              const citations = citationData?.citations || 0;
              const isVoya = company === 'Voya';
              const isActive = hoveredCompany === null || hoveredCompany === company;
              const isExpanded = expandedCompany === company;
              const leadsListExpanded = !!expandedLeadLists[company];

              // Find prompts where this company leads or is cited
              const promptsWhereLeads: { prompt: string; promptId: string; share: number }[] = [];
              const promptsWhereVoyaAbsent: string[] = [];
              if (isExpanded) {
                for (const p of trackedPrompts) {
                  const shares = perPromptShares[p.id];
                  if (!shares) continue;
                  const companyShare = shares[company] || 0;
                  if (companyShare > 0) {
                    // Check if this company leads on this prompt
                    const maxShare = Math.max(...Object.values(shares));
                    if (companyShare === maxShare) {
                      promptsWhereLeads.push({ prompt: p.prompt, promptId: p.id, share: companyShare });
                    }
                    // Also note where Voya is absent but this company is cited
                    if (!isVoya && (shares['Voya'] || 0) === 0) {
                      promptsWhereVoyaAbsent.push(p.prompt);
                    }
                  }
                }
                promptsWhereLeads.sort((a, b) => b.share - a.share);
              }

              // Collect sources specific to prompts where this company leads
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
              // Fall back to global summary if no per-prompt data
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
                    {/* Citation bar */}
                    <div className="flex-1 h-1.5 bg-foreground/[0.06] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${Math.min((citations / 50) * 100, 100)}%`,
                          backgroundColor: color + (isVoya ? '' : '99') 
                        }}
                      />
                    </div>
                    <span className="text-[11px] tabular-nums min-w-[50px] text-right font-semibold" style={{ color: isActive ? color : '#8b949e' }}>
                      {citations}
                    </span>
                    <span className="text-[10px] text-muted-foreground min-w-[50px] text-right">
                      cite{citations !== 1 ? 's' : ''}
                    </span>
                  </button>

                  {/* Expanded detail on hover — where they lead, what it means */}
                  {isExpanded && !isVoya && promptsWhereLeads.length > 0 && (
                    <div className="ml-7 mt-1 mb-2 pl-3 border-l-2 space-y-1" style={{ borderColor: color + '40' }}>
                      <p className="text-[10px] text-muted-foreground font-medium">
                        Leads on {promptsWhereLeads.length} prompt{promptsWhereLeads.length !== 1 ? 's' : ''}
                        {promptsWhereVoyaAbsent.length > 0 && (
                          <span className="text-amber-400"> · Voya absent on {promptsWhereVoyaAbsent.length}</span>
                        )}
                      </p>
                      <p className="text-[10px] text-foreground/50">Cited from prompts:</p>
                      {leadsToShow.map((p, i) => (
                        <p key={i} className="text-[10px] text-foreground/60 truncate">
                          "{p.prompt}" <span style={{ color }}>{p.share}%</span>
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
                    </div>
                  )}

                  {/* Voya expanded: show where we're winning */}
                  {isExpanded && isVoya && (
                    <div className="ml-7 mt-1 mb-2 pl-3 border-l-2 space-y-1" style={{ borderColor: VOYA_COLOR + '40' }}>
                      {promptsWhereLeads.length > 0 ? (
                        <>
                          <p className="text-[10px] text-emerald-400 font-medium">
                            Leading on {promptsWhereLeads.length} prompt{promptsWhereLeads.length !== 1 ? 's' : ''}
                          </p>
                          <p className="text-[10px] text-foreground/50">Cited from prompts:</p>
                          {leadsToShow.map((p, i) => (
                            <p key={i} className="text-[10px] text-foreground/60 truncate">
                              "{p.prompt}" <span className="text-voya-orange">{p.share}%</span>
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

    </div>
  );
}
