import { useEffect, useState } from 'react';
import { PageIntro, Panel, Placeholder } from './AppShell';
import { API_BASE } from '../lib/api';

interface VoCStats {
  total_questions: number;
  total_clusters: number;
  promoted: number;
  conversations: number;
  total_signals: number;
}

interface VoCQuestion {
  id: number;
  verbatim: string;
  normalized: string;
  topic: string;
  cluster_id: string;
  promoted: boolean;
}

interface VoCCluster {
  id: string;
  label: string;
  count: number;
  topic_area: string;
}

interface SignalAggregate {
  label: string;
  business_intent: string;
  count: number;
  avg_confidence: number;
  latest_detected: string;
}

interface WeeklyTrend {
  week: string;
  label: string;
  count: number;
}

interface SignalHistory {
  total_signals: number;
  top_signals: SignalAggregate[];
  weekly_trends: WeeklyTrend[];
  source_breakdown: { source: string; count: number }[];
  priority_dist: { priority: string; count: number }[];
}

export function ListenView() {
  const [stats, setStats] = useState<VoCStats | null>(null);
  const [questions, setQuestions] = useState<VoCQuestion[]>([]);
  const [clusters, setClusters] = useState<VoCCluster[]>([]);
  const [history, setHistory] = useState<SignalHistory | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/voc/stats`).then(r => r.json()).then(setStats).catch(() => {});
    fetch(`${API_BASE}/voc/questions?limit=10`).then(r => r.json()).then(d => setQuestions(d ?? [])).catch(() => {});
    fetch(`${API_BASE}/voc/clusters`).then(r => r.json()).then(d => setClusters(d ?? [])).catch(() => {});
    fetch(`${API_BASE}/voc/history`).then(r => r.json()).then(setHistory).catch(() => {});
  }, []);

  const promote = async (id: number) => {
    await fetch(`${API_BASE}/voc/promote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question_id: id }),
    });
    setQuestions(qs => qs.map(q => q.id === id ? { ...q, promoted: true } : q));
  };

  return (
    <>
      <PageIntro
        eyebrow="Listen · VoC Listening Post"
        title="What customers are actually asking — in their own words."
        lede="Replace prompt guessing with real demand. Pull questions from voice, survey, and chat channels, cluster them by intent, and promote the strongest ones into Measure."
      />

      <div className="grid lg:grid-cols-5 gap-5">
        {[
          { k: 'Genesys signals', v: stats?.total_signals ?? '—' },
          { k: 'Conversations', v: stats?.conversations ?? '—' },
          { k: 'Questions extracted', v: stats?.total_questions ?? '—' },
          { k: 'Intent clusters', v: stats?.total_clusters ?? '—' },
          { k: 'Promoted to Measure', v: stats?.promoted ?? '—' },
        ].map((c) => (
          <Panel key={c.k}>
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{c.k}</p>
            <p className="mt-3 font-display text-5xl leading-none">{c.v}</p>
          </Panel>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-5 mt-5">
        <Panel className="lg:col-span-2" title="Top customer questions" hint="Last 7 days">
          <div className="space-y-3">
            {questions.length === 0 ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 rounded-xl border border-border bg-background p-4">
                  <div className="flex-1">
                    <div className="h-3 w-3/4 rounded bg-secondary" />
                    <div className="mt-2 flex gap-2">
                      <span className="h-4 w-16 rounded-full bg-secondary/70" />
                      <span className="h-4 w-20 rounded-full bg-secondary/70" />
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">Awaiting data</span>
                </div>
              ))
            ) : (
              questions.map((q) => (
                <div key={q.id} className="flex items-center gap-4 rounded-xl border border-border bg-background p-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{q.normalized}</p>
                    <div className="mt-1 flex gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{q.topic}</span>
                      {q.cluster_id && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/70 text-muted-foreground">{q.cluster_id}</span>
                      )}
                    </div>
                  </div>
                  {q.promoted ? (
                    <span className="text-xs text-green-600 font-medium">✓ Promoted</span>
                  ) : (
                    <button onClick={() => promote(q.id)} className="text-xs text-voya-orange font-medium whitespace-nowrap hover:underline">
                      Promote → Measure
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </Panel>
        <Panel title="Signal sources">
          <ul className="space-y-3">
            {history && history.source_breakdown.length > 0 ? (
              history.source_breakdown.map((s) => (
                <li key={s.source} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium capitalize">{s.source.replace('-', ' ')}</p>
                    <p className="text-xs text-muted-foreground">{s.count.toLocaleString()} signals detected</p>
                  </div>
                  <span className="h-2 w-2 rounded-full bg-voya-orange" />
                </li>
              ))
            ) : (
              <>
                <li className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">Genesys Voice</p>
                    <p className="text-xs text-muted-foreground">Awaiting poller data</p>
                  </div>
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-pulse" />
                </li>
                <li className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">Chatbot transcripts</p>
                    <p className="text-xs text-muted-foreground">Planned</p>
                  </div>
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
                </li>
                <li className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">App Store reviews</p>
                    <p className="text-xs text-muted-foreground">Phase 2</p>
                  </div>
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
                </li>
              </>
            )}
          </ul>
          {history && history.priority_dist.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2">By priority</p>
              <div className="space-y-1">
                {history.priority_dist.map((p) => (
                  <div key={p.priority} className="flex items-center justify-between text-xs">
                    <span className={`px-2 py-0.5 rounded-full ${
                      p.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                      p.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                      'bg-secondary text-muted-foreground'
                    }`}>{p.priority || 'unset'}</span>
                    <span className="text-muted-foreground">{p.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Panel>
      </div>

      {/* Historical Signal Aggregate — Genesys conversation signals */}
      <Panel title="Genesys signal history" hint="Aggregated · Anonymized" className="mt-5">
        {history && history.top_signals.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="pb-2 font-medium">Detected signal</th>
                  <th className="pb-2 font-medium">Business intent</th>
                  <th className="pb-2 font-medium text-right">Count</th>
                  <th className="pb-2 font-medium text-right">Avg confidence</th>
                  <th className="pb-2 font-medium text-right">Last seen</th>
                </tr>
              </thead>
              <tbody>
                {history.top_signals.map((s, i) => (
                  <tr key={i} className="border-b border-border/50 last:border-0">
                    <td className="py-2 font-medium text-sm">{s.label}</td>
                    <td className="py-2 text-xs text-muted-foreground">{s.business_intent}</td>
                    <td className="py-2 text-right font-mono text-xs font-semibold">{s.count}</td>
                    <td className="py-2 text-right text-xs">
                      <span className={`px-2 py-0.5 rounded-full ${
                        s.avg_confidence >= 0.8 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                        s.avg_confidence >= 0.5 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                        'bg-secondary text-muted-foreground'
                      }`}>{(s.avg_confidence * 100).toFixed(0)}%</span>
                    </td>
                    <td className="py-2 text-right text-xs text-muted-foreground">
                      {s.latest_detected ? new Date(s.latest_detected).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm">Waiting for Genesys conversation signals...</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              The Vantage-AI poller fetches completed calls every 15 min and extracts life events, sentiment, and business intent signals.
            </p>
          </div>
        )}
      </Panel>

      {/* Weekly trends */}
      {history && history.weekly_trends.length > 0 && (
        <Panel title="Weekly signal trends" hint="Last 8 weeks" className="mt-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(
              history.weekly_trends.reduce<Record<string, number>>((acc, t) => {
                acc[t.label] = (acc[t.label] || 0) + t.count;
                return acc;
              }, {})
            )
              .sort(([, a], [, b]) => b - a)
              .slice(0, 8)
              .map(([label, count]) => (
                <div key={label} className="rounded-lg border border-border p-3 text-center">
                  <p className="text-lg font-semibold">{count}</p>
                  <p className="text-xs text-muted-foreground truncate">{label}</p>
                </div>
              ))}
          </div>
        </Panel>
      )}

      <Panel title="Intent clusters" hint="Auto-grouped" className="mt-5">
        {clusters.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {clusters.map((c) => (
              <div key={c.id} className="rounded-lg border border-border p-3 text-center">
                <p className="text-lg font-semibold">{c.count}</p>
                <p className="text-xs text-muted-foreground truncate">{c.label}</p>
                <p className="text-[10px] text-muted-foreground/60">{c.topic_area}</p>
              </div>
            ))}
          </div>
        ) : (
          <Placeholder label="Topic map — bubbles sized by volume, colored by sentiment" height={220} />
        )}
      </Panel>
    </>
  );
}
