import { useMemo, useState } from 'react';
import { API_BASE } from '@/lib/api';
import { PageIntro, Panel } from './AppShell';

interface ScoreCheck {
  name: string;
  passed: boolean;
  detail: string;
}

interface ScoreSuggestion {
  priority: string;
  area: string;
  issue: string;
  recommendation: string;
}

interface ScoreResponse {
  status: 'ok' | 'partial';
  error?: string;
  result: {
    scores: {
      seo_score: number;
      geo_score: number;
      aeo_score: number;
      google_ai_score: number;
      reading_grade: number;
      overall_score: number;
    };
    checks: ScoreCheck[];
    suggestions: ScoreSuggestion[];
    revised_html: string;
    revised_title: string;
    revised_description: string;
  };
}

function scoreBand(score: number) {
  if (score >= 80) return { label: 'Strong', tone: 'text-emerald-400' };
  if (score >= 65) return { label: 'Needs tuning', tone: 'text-amber-400' };
  return { label: 'At risk', tone: 'text-red-400' };
}

export function ScoreView() {
  const [draft, setDraft] = useState('');
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [articleType, setArticleType] = useState('guide');
  const [url, setURL] = useState('');
  const [contentId, setContentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<ScoreResponse | null>(null);

  const overallScore = result?.result?.scores?.overall_score ?? 0;
  const ringDegrees = Math.max(0, Math.min(100, overallScore)) * 3.6;
  const band = scoreBand(overallScore);

  const topIssue = useMemo(() => result?.result.suggestions?.[0], [result]);
  const failedChecks = useMemo(() => (result?.result.checks || []).filter(c => !c.passed), [result]);

  const subScores = useMemo(() => {
    if (!result?.result?.scores) {
      return [
        { label: 'Clarity', value: null as number | null },
        { label: 'Authority', value: null as number | null },
        { label: 'Structure', value: null as number | null },
      ];
    }
    const s = result.result.scores;
    return [
      { label: 'Clarity', value: s.aeo_score || Math.round((s.seo_score + s.geo_score) / 2) },
      { label: 'Authority', value: s.google_ai_score || s.geo_score },
      { label: 'Structure', value: s.seo_score },
    ];
  }, [result]);

  async function scoreDraft() {
    setLoading(true);
    setError('');
    try {
      const payload: Record<string, unknown> = {
        draft,
        title,
        topic,
        article_type: articleType,
      };
      if (url.trim()) payload.url = url.trim();
      if (contentId.trim()) payload.content_id = Number(contentId.trim());

      const res = await fetch(`${API_BASE}/content/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const raw = await res.text();
      let data: any = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        data = { error: raw || 'Unexpected server response' };
      }
      if (!res.ok) {
        throw new Error(data?.error || `Scoring failed (${res.status})`);
      }
      setResult(data as ScoreResponse);
      if (data?.result?.revised_html) {
        setDraft(data.result.revised_html);
      }
      if (data?.result?.revised_title) {
        setTitle(data.result.revised_title);
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to score draft');
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageIntro
        eyebrow="Create · Content scoring"
        title="Content Scoring"
        lede="Validate AI findability before publish. Submit a draft, review score confidence, and act on the highest-impact edits first."
      />

      <div className="grid lg:grid-cols-3 gap-5">
        <Panel className="lg:col-span-2" title="Draft" hint="Paste or upload">
          <div className="grid md:grid-cols-2 gap-3 mb-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title (optional)"
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Topic (optional)"
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            <input
              value={url}
              onChange={(e) => setURL(e.target.value)}
              placeholder="URL to score (optional)"
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm md:col-span-2"
            />
            <input
              value={contentId}
              onChange={(e) => setContentId(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="Existing content ID (optional)"
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            <select
              value={articleType}
              onChange={(e) => setArticleType(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="guide">Guide</option>
              <option value="comparison">Comparison</option>
              <option value="explainer">Explainer</option>
              <option value="checklist">Checklist</option>
            </select>
          </div>

          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Paste draft content here (or use URL/content ID above)…"
            className="rounded-xl border border-dashed border-border bg-background p-4 min-h-[280px] text-sm w-full"
          />

          {error && (
            <p className="mt-3 text-xs text-red-500">{error}</p>
          )}

          <div className="mt-3 flex gap-2 flex-wrap">
            <button
              onClick={scoreDraft}
              disabled={loading || (!draft.trim() && !url.trim() && !contentId.trim())}
              className="rounded-full bg-gradient-voya text-white text-xs font-medium px-4 py-2 disabled:opacity-50"
            >
              {loading ? 'Scoring…' : 'Score draft'}
            </button>
            <button
              onClick={() => {
                setDraft('');
                setURL('');
                setContentId('');
                setResult(null);
                setError('');
              }}
              className="rounded-full border border-border text-xs px-4 py-2"
            >
              Clear
            </button>
            <button className="rounded-full border border-border text-xs px-4 py-2 opacity-70" disabled>
              Upload .docx (next)
            </button>
          </div>
        </Panel>

        <Panel title="AI findability score">
          <div className="grid place-items-center py-4">
            <div className="relative h-32 w-32 rounded-full bg-secondary grid place-items-center">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(var(--voya-orange) ${ringDegrees}deg, var(--secondary) ${ringDegrees}deg)`,
                }}
              />
              <div className="absolute inset-2 rounded-full bg-card grid place-items-center">
                <span className="font-display text-4xl">{result ? overallScore : '—'}</span>
              </div>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">Score draft to see result</p>
            {result && <p className={`mt-1 text-xs font-medium ${band.tone}`}>{band.label}</p>}
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-[10px] uppercase tracking-widest text-muted-foreground">
            {subScores.map((s) => (
              <div key={s.label} className="rounded-lg bg-secondary/60 py-2">
                {s.label}<br /><span className="text-foreground">{s.value ?? '—'}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {result && (
        <div className="rounded-2xl bg-card border border-border shadow-card p-5 mt-5">
          <h3 className="font-semibold text-sm text-foreground mb-3">Executive Summary</h3>
          <div className="space-y-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Bottom Line</p>
              <p className="text-sm text-foreground/90 leading-relaxed">
                This draft scored <span className="font-semibold text-foreground">{overallScore}/100</span> for AI findability and is currently <span className={`font-semibold ${band.tone}`}>{band.label.toLowerCase()}</span> for citation readiness.
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">So What</p>
              <p className="text-sm text-foreground/90 leading-relaxed">
                {failedChecks.length > 0
                  ? `${failedChecks.length} critical check${failedChecks.length > 1 ? 's are' : ' is'} not yet passing, reducing the likelihood this draft is selected as a citation source in AI answers.`
                  : 'All core checks are passing, which increases citation likelihood and reduces pre-publish risk.'}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Now What</p>
              <p className="text-sm text-foreground/90 leading-relaxed">
                {topIssue
                  ? `Prioritize this first: ${topIssue.recommendation}`
                  : 'Address the highest-priority edits below, then rescore to confirm readiness before publishing.'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-5 mt-5">
        <Panel title="Checks" hint="What we look for">
          <ul className="space-y-2">
            {(result?.result.checks || []).map((c) => (
              <li key={c.name} className="flex items-start gap-3 text-sm">
                <span className={`h-4 w-4 mt-0.5 rounded-full border ${c.passed ? 'bg-emerald-500/20 border-emerald-500/40' : 'bg-red-500/10 border-red-500/40'}`} />
                <span className="text-foreground/80">
                  <span className="font-medium text-foreground">{c.name}</span>
                  <span className="block text-xs text-muted-foreground mt-0.5">{c.detail}</span>
                </span>
              </li>
            ))}
            {!result && <li className="text-sm text-muted-foreground">Score a draft to run checks.</li>}
          </ul>
        </Panel>
        <Panel title="Suggested edits" hint="Highest impact first">
          <div className="space-y-2 max-h-[240px] overflow-auto pr-1">
            {(result?.result.suggestions || []).map((s, idx) => (
              <div key={`${s.area}-${idx}`} className="rounded-lg border border-border bg-secondary/30 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{s.area}</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${s.priority === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    {s.priority}
                  </span>
                </div>
                <p className="text-sm text-foreground mt-1">{s.issue}</p>
                <p className="text-xs text-foreground/70 mt-1">{s.recommendation}</p>
              </div>
            ))}
            {!result && <p className="text-sm text-muted-foreground">Inline suggestions appear here after scoring.</p>}
          </div>
        </Panel>
      </div>
    </>
  );
}
