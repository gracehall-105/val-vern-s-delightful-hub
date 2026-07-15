// @ts-nocheck — direct port from VS Code; tighten types incrementally
import { useState, useEffect, useRef, useCallback } from 'react';
import { Check, ChevronRight, Globe, Edit3, Sparkles, ArrowLeft, ArrowRight, Save, X, Brain, Undo2, AlertTriangle } from 'lucide-react';
import { API_BASE } from '@/lib/api';

interface PendingTopic {
  topic: string;
  articleType: string;
  rationale?: string;
  targetGap?: string;
  contentId?: number;
}

interface Destination {
  id: string;
  name: string;
  why: string;
  url: string;
  type: 'recommended' | 'alternative';
}

interface WeeklyContentItem {
  id: number;
  week_label: string;
  topic: string;
  article_type: string;
  title: string;
  html_content: string;
  meta_description: string;
  word_count: number;
  seo_score: number;
  geo_score: number;
  compliance_approved: boolean;
  compliance_issues: string[];
  brand_score: number;
  destinations: Destination[];
  metadata: Record<string, string>;
  rationale: string;
  target_gap: string;
  status: string;
  created_at: string;
}

interface OperationsProps {
  pendingTopic?: PendingTopic | null;
  onTopicConsumed?: () => void;
}

export function Operations({ pendingTopic, onTopicConsumed }: OperationsProps) {
  const [items, setItems] = useState<WeeklyContentItem[]>([]);
  const [selected, setSelected] = useState<WeeklyContentItem | null>(null);
  const [selectedDest, setSelectedDest] = useState<string | null>(null);
  const [showArticle, setShowArticle] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editHTML, setEditHTML] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);
  const consumed = useRef(false);

  const startEditing = useCallback(() => {
    if (!selected) return;
    setEditHTML(selected.html_content);
    setEditing(true);
    setSaveMessage('');
  }, [selected]);

  const cancelEditing = useCallback(() => {
    setEditing(false);
    setEditHTML('');
    setSaveMessage('');
  }, []);

  const saveEdit = useCallback(async () => {
    if (!selected || !editorRef.current) return;
    setSaving(true);
    const newHTML = editorRef.current.innerHTML;
    try {
      await fetch(`${API_BASE}/content/edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selected.id, html: newHTML }),
      });
      // Update local state
      setSelected({ ...selected, html_content: newHTML });
      setItems(prev => prev.map(i => i.id === selected.id ? { ...i, html_content: newHTML } : i));
      setEditing(false);
      setSaveMessage('Saved — your edits help improve future content');
      setTimeout(() => setSaveMessage(''), 4000);
    } catch {
      setSaveMessage('Failed to save');
    } finally {
      setSaving(false);
    }
  }, [selected]);

  // Load weekly content on mount
  useEffect(() => {
    fetchWeeklyContent();
  }, []);

  // When navigating from Command Center / Intelligence with a specific topic
  useEffect(() => {
    if (pendingTopic && !consumed.current && items.length > 0) {
      consumed.current = true;
      onTopicConsumed?.();

      // 1. Deep-link by content ID if provided (from category-specific click)
      if (pendingTopic.contentId) {
        const byId = items.find(i => i.id === pendingTopic.contentId);
        if (byId) { openItem(byId); return; }
      }

      // 2. Match by target_gap keyword overlap (recommendation → content share the same gap prompt)
      if (pendingTopic.targetGap) {
        const gapWords = pendingTopic.targetGap.toLowerCase().split(/\s+/).filter(w => w.length > 2);
        let bestMatch: typeof items[0] | null = null;
        let bestScore = 0;
        for (const item of items) {
          const haystack = `${item.topic} ${item.target_gap || ''}`.toLowerCase();
          const score = gapWords.reduce((s, w) => s + (haystack.includes(w) ? 1 : 0), 0);
          if (score > bestScore) { bestScore = score; bestMatch = item; }
        }
        if (bestMatch && bestScore >= 2) { openItem(bestMatch); return; }
      }

      // 3. Fuzzy topic match
      const match = items.find(
        i => i.topic === pendingTopic.topic ||
          i.topic.toLowerCase().includes(pendingTopic.topic.toLowerCase()) ||
          pendingTopic.topic.toLowerCase().includes(i.topic.toLowerCase())
      );
      if (match) {
        openItem(match);
      } else if (items.length > 0) {
        openItem(items[0]);
      }
    }
  }, [pendingTopic, items, onTopicConsumed]);

  useEffect(() => {
    if (!pendingTopic) consumed.current = false;
  }, [pendingTopic]);

  const fetchWeeklyContent = async () => {
    try {
      const res = await fetch(`${API_BASE}/content/weekly`);
      const data = await res.json();
      const loaded = (data.items || []) as WeeklyContentItem[];
      // Ensure destinations are always arrays
      for (const item of loaded) {
        if (!item.destinations || !Array.isArray(item.destinations)) {
          item.destinations = getDefaultDestinations();
        }
      }
      setItems(loaded);
    } catch {
      // No content yet — that's fine
    }
  };

  const openItem = (item: WeeklyContentItem) => {
    setSelected(item);
    setSelectedDest(item.destinations?.[0]?.id || 'voya');
    setShowArticle(true);
    setConfirmed(false);
    setShowConfirmModal(false);
  };

  const activateItem = async () => {
    if (!selected) return;
    try {
      const res = await fetch(`${API_BASE}/content/status?id=${selected.id}&status=published`, { method: 'POST' });
      if (!res.ok) return;
      setItems(prev => prev.map(i => i.id === selected.id ? { ...i, status: 'published' } : i));
      setSelected(prev => prev ? { ...prev, status: 'published' } : prev);
      setShowConfirmModal(false);
      setConfirmed(true);
    } catch { /* network error — no state change */ }
  };

  const deactivateItem = async (item: WeeklyContentItem) => {
    try {
      const res = await fetch(`${API_BASE}/content/status?id=${item.id}&status=ready`, { method: 'POST' });
      if (!res.ok) return;
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'ready' } : i));
      setConfirmed(false);
    } catch { /* network error — no state change */ }
  };

  const selectedDestination = selected?.destinations?.find(d => d.id === selectedDest);

  // ── List view: show all weekly content as strategic recommendation cards ──
  if (!selected) {
    return (
      <div className="space-y-5 animate-slide-in max-w-[820px]">
        <div className="rounded-2xl bg-card border border-border shadow-card p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-6 h-6 rounded-lg bg-voya-orange/10 flex items-center justify-center">
              <Brain size={12} className="text-voya-orange" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">This Week's Content</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {items.length > 0
                  ? `${items.length} pieces ready for review · Week ${items[0]?.week_label || ''}`
                  : 'Content generates every Sunday at 7:30 AM ET'}
              </p>
            </div>
          </div>

          {items.length === 0 && (
            <div className="text-center py-10">
              <Sparkles size={32} className="text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="text-sm text-muted-foreground">No content generated yet</p>
              <p className="text-xs text-muted-foreground mt-1">Content will appear here after the next scheduled run</p>
            </div>
          )}

          <div className="space-y-3">
            {items.map((item, index) => {
              const priority = index === 0 ? 'critical' : index === 1 ? 'high' : 'medium';
              return (
                <div key={item.id} className="rounded-xl border border-border bg-secondary/30 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                          priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                          priority === 'high' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-sky-500/20 text-sky-400'
                        }`}>
                          #{index + 1} {priority}
                        </span>
                        <span className="text-[10px] text-muted-foreground">{item.article_type}</span>
                      </div>
                      <p className="text-sm font-semibold text-foreground leading-snug">{item.title || item.topic}</p>
                      {item.meta_description && (
                        <p className="text-xs text-foreground/70 mt-1 leading-relaxed line-clamp-2">{item.meta_description}</p>
                      )}
                      {item.rationale && (
                        <p className="text-[10px] text-muted-foreground mt-1.5">Gap: {item.rationale}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] text-muted-foreground">{item.word_count} words</span>
                        {item.status === 'published' && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Published</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button
                        onClick={() => openItem(item)}
                        className="rounded-full bg-gradient-voya text-white font-medium shadow-soft text-[11px] px-3 py-1.5 flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                      >
                        <Edit3 size={11} />
                        Review &amp; Edit
                      </button>
                      {item.status === 'published' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); deactivateItem(item); }}
                          className="rounded-full border border-border text-[11px] px-3 py-1.5 flex items-center gap-1.5 whitespace-nowrap cursor-pointer text-muted-foreground hover:text-foreground hover:border-amber-500/50 transition-colors"
                        >
                          <Undo2 size={11} />
                          Unpublish
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── Confirmed state ──
  if (confirmed) {
    return (
      <div className="space-y-5 animate-slide-in max-w-[820px]">
        <div className="rounded-2xl bg-card border border-border shadow-card p-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[hsl(142 76% 36%/0.1)] flex items-center justify-center mx-auto mb-4">
            <Check size={24} className="text-[hsl(142 76% 36%)]" />
          </div>
          <h3 className="font-display text-lg font-bold text-[hsl(var(--foreground))] mb-2">Queued for Publishing</h3>
          <p className="text-sm text-[hsl(var(--foreground)/0.7)] mb-6 max-w-[400px] mx-auto">
            "{selected.title || selected.topic}" will be published to <strong>{selectedDestination?.name}</strong> after your final review.
          </p>

          <div className="inline-block text-left rounded-2xl bg-card border border-border shadow-card p-5 mb-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5 text-sm text-[hsl(var(--foreground)/0.7)]">
                <Check size={14} className="text-[hsl(142 76% 36%)] flex-shrink-0" />
                <span>AI-optimized for search &amp; generative visibility</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-[hsl(var(--foreground)/0.7)]">
                <Globe size={14} className="text-[hsl(var(--voya-orange))] flex-shrink-0" />
                <span>Destination: <strong>{selectedDestination?.name}</strong></span>
              </div>
            </div>
          </div>

          <button
            onClick={() => { setSelected(null); setConfirmed(false); fetchWeeklyContent(); }}
            className="rounded-full bg-gradient-voya text-white font-medium shadow-soft px-6 py-2.5 text-sm font-semibold cursor-pointer"
          >
            Back to Content
          </button>
        </div>
      </div>
    );
  }

  // ── Detail view: single content piece ──
  return (
    <div className="space-y-5 animate-slide-in max-w-[820px]">
      {/* Back button */}
      <button
        onClick={() => setSelected(null)}
        className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--voya-orange))] transition-colors cursor-pointer"
      >
        <ArrowLeft size={12} />
        Back to all content
      </button>

      {/* Header with scores */}
      <div className="rounded-2xl bg-card border border-border shadow-card p-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-[hsl(var(--foreground))] leading-snug">{selected.title || selected.topic}</h3>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
              {selected.word_count} words · {selected.article_type}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400">
              AI Optimized
            </span>
          </div>
        </div>

        {selected.meta_description && (
          <p className="text-sm text-[hsl(var(--foreground)/0.7)] leading-relaxed">{selected.meta_description}</p>
        )}
      </div>


      {/* Article content */}
      {selected.html_content && (
        <div className="rounded-2xl bg-card border border-border shadow-card p-0 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-[hsl(var(--border))]">
            <button
              onClick={() => { if (!showArticle) setShowArticle(true); else if (!editing) setShowArticle(false); }}
              className="flex items-center gap-2 text-xs font-medium text-[hsl(var(--foreground)/0.7)] hover:text-[hsl(var(--foreground))] transition-colors cursor-pointer"
            >
              <Edit3 size={12} className="text-[hsl(var(--voya-orange))]" />
              {showArticle ? (editing ? 'Editing article' : 'Hide article') : 'Show article'}
              <ChevronRight size={12} className={`transition-transform ${showArticle ? 'rotate-90' : ''}`} />
            </button>
            {showArticle && (
              <div className="flex items-center gap-2">
                {editing ? (
                  <>
                    <button
                      onClick={cancelEditing}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold text-white bg-red-500 hover:bg-red-600 transition-all cursor-pointer"
                    >
                      <X size={10} />
                      Cancel
                    </button>
                    <button
                      onClick={saveEdit}
                      disabled={saving}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold text-white bg-emerald-500 hover:bg-emerald-600 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Save size={10} />
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={startEditing}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium text-[hsl(var(--foreground)/0.7)] bg-foreground/[0.03] border border-[hsl(var(--border))] hover:border-[hsl(var(--voya-orange))]/50 hover:text-[hsl(var(--voya-orange))] transition-all cursor-pointer"
                  >
                    <Edit3 size={10} />
                    Edit
                  </button>
                )}
              </div>
            )}
          </div>
          {showArticle && (
            <div className={`p-5 max-h-[450px] overflow-y-auto ${editing ? 'bg-foreground/[0.02]' : ''}`}>
              {editing ? (
                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  dangerouslySetInnerHTML={{ __html: editHTML }}
                  className="prose prose-sm dark:prose-invert max-w-none text-xs leading-relaxed outline-none [&_h2]:text-sm [&_h2]:font-bold [&_h2]:text-[hsl(var(--foreground))] [&_h2]:mt-5 [&_h2]:mb-2 [&_p]:text-[hsl(var(--foreground)/0.7)] [&_li]:text-[hsl(var(--foreground)/0.7)] [&_strong]:text-[hsl(var(--foreground))] focus:ring-0 min-h-[200px]"
                />
              ) : (
                <div
                  className="prose prose-sm dark:prose-invert max-w-none text-xs leading-relaxed [&_h2]:text-sm [&_h2]:font-bold [&_h2]:text-[hsl(var(--foreground))] [&_h2]:mt-5 [&_h2]:mb-2 [&_p]:text-[hsl(var(--foreground)/0.7)] [&_li]:text-[hsl(var(--foreground)/0.7)] [&_strong]:text-[hsl(var(--foreground))]"
                  dangerouslySetInnerHTML={{ __html: selected.html_content }}
                />
              )}
            </div>
          )}
          {saveMessage && (
            <div className="px-5 py-2 border-t border-[hsl(var(--border))]">
              <p className={`text-[10px] font-medium ${saveMessage.includes('Failed') ? 'text-[hsl(0 84% 60%)]' : 'text-[hsl(142 76% 36%)]'}`}>
                {saveMessage}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Where to publish */}
      <div className="rounded-2xl bg-card border border-border shadow-card p-5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-3">Publish To</p>
        <div className="grid grid-cols-2 gap-2">
          {(selected.destinations || getDefaultDestinations()).map(dest => (
            <button
              key={dest.id}
              onClick={() => setSelectedDest(dest.id)}
              className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                selectedDest === dest.id
                  ? 'border-[hsl(var(--voya-orange))] bg-[hsl(var(--voya-orange)/0.1)]'
                  : 'border-[hsl(var(--border))] bg-foreground/[0.02] hover:border-[hsl(var(--voya-orange)/0.5)]'
              }`}
            >
              <div className="flex items-center gap-2">
                <Globe size={12} className={selectedDest === dest.id ? 'text-[hsl(var(--voya-orange))]' : 'text-[hsl(var(--muted-foreground))]'} />
                <span className="text-xs font-semibold text-[hsl(var(--foreground))]">{dest.name}</span>
                {dest.type === 'recommended' && (
                  <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-[hsl(142 76% 36%/0.1)] text-[hsl(142 76% 36%)] font-medium">Best</span>
                )}
              </div>
              <p className="text-[9px] text-[hsl(var(--muted-foreground))] mt-1 ml-5 line-clamp-1">{dest.why}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Activate button — only show when not already published */}
      {selected.status !== 'published' && (
        <button
          onClick={() => setShowConfirmModal(true)}
          className="w-full rounded-full bg-gradient-voya text-white font-medium shadow-soft py-3.5 text-sm font-semibold flex items-center justify-center gap-2 rounded-xl cursor-pointer"
        >
          Activate — Publish to {selectedDestination?.name || 'selected platform'}
          <ArrowRight size={14} />
        </button>
      )}

      {/* Confirmation modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div role="dialog" aria-modal="true" aria-labelledby="confirm-activation-title" className="bg-card border border-border rounded-2xl shadow-xl p-6 max-w-md w-full mx-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <AlertTriangle size={20} className="text-amber-500" />
              </div>
              <div>
                <h3 id="confirm-activation-title" className="text-base font-semibold text-foreground">Confirm Activation</h3>
                <p className="text-xs text-muted-foreground">This will mark content as live</p>
              </div>
            </div>
            <div className="rounded-xl bg-secondary/50 border border-border p-4 mb-5">
              <p className="text-sm font-medium text-foreground mb-2">{selected.title || selected.topic}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>→ {selectedDestination?.name || 'selected platform'}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={activateItem}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-voya text-white text-sm font-semibold shadow-soft cursor-pointer flex items-center justify-center gap-2"
              >
                <Check size={14} />
                Confirm & Publish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getDefaultDestinations(): Destination[] {
  return [
    { id: 'voya', name: 'Voya.com Blog', why: 'Foundation — builds domain authority for AI citations over time', url: 'https://voya.com/blog', type: 'recommended' },
    { id: 'linkedin', name: 'LinkedIn Article', why: 'Professional finance content gets cited in Copilot and Perplexity', url: 'https://linkedin.com', type: 'recommended' },
    { id: 'reddit', name: 'Reddit r/personalfinance', why: 'GPT-4o cites Reddit threads frequently for retirement queries', url: 'https://reddit.com/r/personalfinance', type: 'alternative' },
    { id: 'medium', name: 'Medium (Voya Publication)', why: 'Medium articles appear in Perplexity citations for how-to queries', url: 'https://medium.com', type: 'alternative' },
  ];
}
