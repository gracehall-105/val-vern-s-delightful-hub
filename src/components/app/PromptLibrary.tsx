// @ts-nocheck — direct port from VS Code; tighten types incrementally
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Play, ChevronDown, ChevronRight, Loader2, RefreshCw, Building2, Users, Shield, BookOpen, BarChart3, Star, Folder, Trash2, Sparkles } from 'lucide-react';
import { API_BASE } from '@/lib/api';

// ─── Types ───────────────────────────────────────────────────────────────────

interface PromptData {
  id: string;
  text: string;
  category: string;
  audience: string;
  domain: string;
  cluster_id: string;
}

export interface PromptShareData {
  prompt_id: string;
  prompt: string;
  shares: Record<string, number>;
}

// ─── Category Display ────────────────────────────────────────────────────────

const categoryMeta: Record<string, { label: string; Icon: typeof RefreshCw }> = {
  rollover:  { label: 'Rollover',  Icon: RefreshCw },
  providers: { label: 'Providers', Icon: Building2 },
  advisors:  { label: 'Advisors',  Icon: Users },
  benefits:  { label: 'Benefits',  Icon: Shield },
  reference: { label: 'Reference', Icon: BookOpen },
  planning:  { label: 'Planning',  Icon: BarChart3 },
  brand:     { label: 'Brand',     Icon: Star },
  custom:    { label: 'My Prompts', Icon: Sparkles },
};

function getCategoryMeta(cat: string) {
  return categoryMeta[cat] || { label: cat, Icon: Folder };
}

// ─── Custom Prompt Runner ────────────────────────────────────────────────────

function CustomPromptRunner({ onSaved }: { onSaved?: () => void }) {
  const [query, setQuery] = useState('');
  const [running, setRunning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [result, setResult] = useState<{ response: string; model: string; mentions: string } | null>(null);

  const handleSave = useCallback(async () => {
    if (!query.trim() || saving) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/som/prompts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: query.trim() }),
      });
      if (res.ok) {
        setSaved(true);
        onSaved?.();
      }
    } catch (e) {
      console.error('Failed to save prompt:', e);
    } finally {
      setSaving(false);
    }
  }, [query, saving, onSaved]);

  const handleRun = useCallback(async () => {
    if (!query.trim() || running) return;
    setRunning(true);
    setResult(null);
    try {
      const res = await fetch(`${API_BASE}/som/measure/custom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: query.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        const r = data.result;
        // Format the response: show the raw LLM response and extracted mentions
        const mentions = r?.mentions?.filter((m: any) => m.count > 0)
          .map((m: any) => `${m.company} (${m.position}, ${m.count}×)`)
          .join(', ') || 'No companies detected';
        setResult({
          response: r?.response || 'No response received.',
          model: r?.model_id || 'AI model',
          mentions,
        });
      } else {
        const errData = await res.json().catch(() => null);
        setResult({ response: errData?.error || `Error: ${res.status} — ${res.statusText}`, model: 'System', mentions: '' });
      }
    } catch (e) {
      setResult({ response: 'Could not reach the backend. Make sure the server is running.', model: 'System', mentions: '' });
    } finally {
      setRunning(false);
    }
  }, [query, running]);

  void handleSave; void saved; void result; // preserved for future use

  return (
    <div className="hidden">
      {/* Coming Soon overlay */}
      <div className="absolute inset-0 flex items-center justify-end pr-5 pointer-events-none">
        <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          Coming Soon
        </span>
      </div>
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center">
          <Play size={14} className="text-muted-foreground" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Run a Custom Prompt</h3>
          <p className="text-[10px] text-muted-foreground">Test any prompt against AI models in real time</p>
        </div>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setSaved(false); }}
          onKeyDown={e => e.key === 'Enter' && handleRun()}
          placeholder="e.g. What are the best 403b providers for teachers?"
          className="flex-1 h-10 px-4 rounded-lg border border-border bg-secondary/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          disabled
        />
        <button
          onClick={handleRun}
          disabled
          className="h-10 px-5 rounded-lg bg-muted text-muted-foreground text-sm font-medium flex items-center gap-2 cursor-not-allowed"
        >
          <Play size={14} />
          Run
        </button>
      </div>
    </div>
  );
}

// ─── Prompt Folder (Category Accordion) ──────────────────────────────────────

function PromptFolder({
  category,
  prompts,
  shares,
  voyaSources,
  onDelete,
}: {
  category: string;
  prompts: PromptData[];
  shares: Record<string, Record<string, number>>;
  voyaSources: Record<string, string[]>;
  onDelete?: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const meta = getCategoryMeta(category);

  // Calculate category-level Voya share
  const avgVoyaShare = useMemo(() => {
    let total = 0, count = 0;
    for (const p of prompts) {
      const s = shares[p.id];
      if (s && s['Voya'] !== undefined) {
        total += s['Voya'];
        count++;
      }
    }
    return count > 0 ? Math.round(total / count) : null;
  }, [prompts, shares]);

  // Count prompts where Voya is cited
  const voyaCited = useMemo(() => {
    return prompts.filter(p => (shares[p.id]?.['Voya'] || 0) > 0).length;
  }, [prompts, shares]);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-foreground/[0.02] transition-colors cursor-pointer"
      >
        <div className="w-8 h-8 rounded-lg bg-foreground/[0.05] flex items-center justify-center">
          <meta.Icon size={16} className="text-foreground/40" />
        </div>
        <div className="flex-1 text-left">
          <span className="text-sm font-semibold text-foreground">{meta.label}</span>
          <span className="ml-2 text-xs text-muted-foreground">{prompts.length} prompts</span>
        </div>
        <div className="flex items-center gap-3">
          {avgVoyaShare !== null && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-voya-orange/10 text-voya-orange">
              Voya {avgVoyaShare}%
            </span>
          )}
          <span className="text-[10px] text-muted-foreground">
            {voyaCited}/{prompts.length} cited
          </span>
          {open ? <ChevronDown size={16} className="text-muted-foreground" /> : <ChevronRight size={16} className="text-muted-foreground" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-border">
          {/* Header row */}
          <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-secondary/40 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
            <div className={category === 'custom' ? 'col-span-7' : 'col-span-8'}>Prompt</div>
            <div className="col-span-2">Voya Share</div>
            <div className={category === 'custom' ? 'col-span-2' : 'col-span-2'}>Status</div>
            {category === 'custom' && <div className="col-span-1"></div>}
          </div>
          {prompts.map(p => {
            const s = shares[p.id] || {};
            const voyaPct = s['Voya'] || 0;
            const isCited = voyaPct > 0;
            return (
              <div key={p.id} className="grid grid-cols-12 gap-2 px-4 py-3 border-t border-border/50 items-center hover:bg-foreground/[0.015] transition-colors">
                <div className={category === 'custom' ? 'col-span-7' : 'col-span-8'}>                  <div className="text-sm text-foreground">{p.text}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{p.audience} · {p.domain}</div>
                </div>
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 rounded-full bg-foreground/[0.06] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-voya-orange"
                        style={{ width: `${Math.min(voyaPct, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-voya-orange">
                      {voyaPct}%
                    </span>
                  </div>
                </div>
                <div className={category === 'custom' ? 'col-span-2' : 'col-span-2'}>
                  {isCited ? (
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-500/10 text-green-600">Cited</span>
                      {(voyaSources[p.id] || []).map(s => (
                        <span key={s} className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600">{s}</span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-500/10 text-red-500">Gap</span>
                  )}
                </div>
                {category === 'custom' && onDelete && (
                  <div className="col-span-1 flex justify-end">
                    <button
                      onClick={() => onDelete(p.id)}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors cursor-pointer"
                      title="Remove prompt"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main PromptLibrary Component ────────────────────────────────────────────


export function PromptLibrary() {
  const [prompts, setPrompts] = useState<PromptData[]>([]);
  const [shares, setShares] = useState<Record<string, Record<string, number>>>({});
  const [voyaSources, setVoyaSources] = useState<Record<string, string[]>>({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Reusable data loader
  const loadData = useCallback(async () => {
    try {
      const [promptsRes, sharesRes] = await Promise.all([
        fetch(`${API_BASE}/som/prompts`),
        fetch(`${API_BASE}/som/shares`),
      ]);
      if (promptsRes.ok) {
        const data = await promptsRes.json();
        setPrompts(data.prompts || []);
      }
      if (sharesRes.ok) {
        const data = await sharesRes.json();
        const map: Record<string, Record<string, number>> = {};
        const mmap: Record<string, string[]> = {};
        for (const item of (data.shares || [])) {
          map[item.prompt_id] = item.shares;
          if (item.voya_sources && item.voya_sources.length > 0) {
            mmap[item.prompt_id] = item.voya_sources;
          }
        }
        setShares(map);
        setVoyaSources(mmap);
      }
    } catch (e) {
      console.error('Failed to load prompt library data:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Delete a custom prompt
  const handleDelete = useCallback(async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/som/prompts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPrompts(prev => prev.filter(p => p.id !== id));
      }
    } catch (e) {
      console.error('Failed to delete prompt:', e);
    }
  }, []);

  // Filter prompts by search
  const filtered = useMemo(() => {
    if (!search.trim()) return prompts;
    const q = search.toLowerCase();
    return prompts.filter(p =>
      p.text.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.domain.toLowerCase().includes(q) ||
      p.audience.toLowerCase().includes(q)
    );
  }, [prompts, search]);

  // Group by category (maintaining order)
  const grouped = useMemo(() => {
    const map = new Map<string, PromptData[]>();
    const order = ['custom', 'rollover', 'providers', 'advisors', 'benefits', 'reference', 'planning', 'brand'];
    for (const cat of order) map.set(cat, []);
    for (const p of filtered) {
      if (!map.has(p.category)) map.set(p.category, []);
      map.get(p.category)!.push(p);
    }
    // Remove empty categories
    for (const [k, v] of map) {
      if (v.length === 0) map.delete(k);
    }
    return map;
  }, [filtered]);

  // Stats
  const totalVoyaCited = useMemo(() => {
    return prompts.filter(p => (shares[p.id]?.['Voya'] || 0) > 0).length;
  }, [prompts, shares]);

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Custom Prompt Runner */}
      <CustomPromptRunner onSaved={loadData} />

      {/* Search bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search prompts…"
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-secondary/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-voya-orange/30 focus:border-voya-orange/50"
          />
        </div>
      </div>

      {/* Summary strip */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">{filtered.length} prompts</span>
        <span>across {grouped.size} categories</span>
        <span>·</span>
        <span>Voya cited in <span className="text-voya-orange font-semibold">{totalVoyaCited}</span> of {prompts.length}</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 size={24} className="animate-spin mr-2" /> Loading prompts…
        </div>
      ) : (
        <div className="space-y-3">
          {[...grouped.entries()].map(([category, catPrompts]) => (
            <PromptFolder
              key={category}
              category={category}
              prompts={catPrompts}
              shares={shares}
              voyaSources={voyaSources}
              onDelete={category === 'custom' ? handleDelete : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
