import { useEffect, useState } from 'react';
import { PageIntro, Panel } from './AppShell';
import { API_BASE } from '@/lib/api';

interface PromptShare {
  prompt_id: string;
  prompt: string;
  shares: Record<string, number>;
}

interface ModelShare {
  model_id: string;
  share_pct: number;
  citations: number;
  prompts: number;
  per_prompt: PromptShare[];
}

interface ModelConfig {
  ID: string;
  Name: string;
  Provider: string;
}

const MODEL_META: Record<string, { label: string; short: string; status: string }> = {
  gpt5: { label: 'ChatGPT (GPT-5)', short: 'GPT-5', status: 'Live' },
  haiku: { label: 'Claude Haiku', short: 'Haiku', status: 'Live' },
};

const MODEL_ORDER = ['gpt5', 'haiku'];

export function ModelsView() {
  const [modelShares, setModelShares] = useState<ModelShare[]>([]);
  const [models, setModels] = useState<ModelConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [sharesRes, modelsRes] = await Promise.all([
          fetch(`${API_BASE}/som/model-shares`),
          fetch(`${API_BASE}/som/models`),
        ]);
        const sharesData = await sharesRes.json();
        const modelsData = await modelsRes.json();
        setModelShares(sharesData.model_shares || []);
        setModels(modelsData.models || []);
      } catch (e) {
        console.error('Failed to fetch model data:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const shareMap = new Map(modelShares.map((ms) => [ms.model_id, ms]));
  const connectedIds = new Set(models.map((m) => m.ID));

  const allPromptIds = new Map<string, string>();
  for (const ms of modelShares) {
    for (const pp of ms.per_prompt || []) {
      if (!allPromptIds.has(pp.prompt_id)) {
        allPromptIds.set(pp.prompt_id, pp.prompt);
      }
    }
  }

  const voyaWins: { prompt: string; models: string[] }[] = [];
  const voyaInvisible: { prompt: string }[] = [];
  for (const [pid, ptext] of allPromptIds) {
    const modelsWithVoya: string[] = [];
    for (const ms of modelShares) {
      const pp = (ms.per_prompt || []).find((p) => p.prompt_id === pid);
      if (pp && (pp.shares['Voya'] || 0) > 0) {
        modelsWithVoya.push(ms.model_id);
      }
    }
    if (modelsWithVoya.length > 0) {
      voyaWins.push({ prompt: ptext, models: modelsWithVoya });
    } else {
      voyaInvisible.push({ prompt: ptext });
    }
  }

  return (
    <>
      <PageIntro
        eyebrow="Measure · Multi-model"
        title="Which model is hardest to crack?"
        lede="Run the same prompt across every model that matters. See where Voya appears on one and not another, and prioritize the platforms with the biggest gaps."
      />

      <div className="grid sm:grid-cols-2 gap-4">
        {MODEL_ORDER.map((mid) => {
          const meta = MODEL_META[mid];
          const ms = shareMap.get(mid);
          const connected = connectedIds.has(mid);
          const share = ms ? `${Math.round(ms.share_pct)}%` : String.fromCharCode(8212) + '%';
          const status = connected ? 'Live' : meta.status;

          return (
            <Panel key={mid}>
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{meta.label}</p>
              <p className={[
                'mt-3 font-display text-4xl leading-none',
                connected && ms ? 'text-foreground' : 'text-muted-foreground/40',
              ].join(' ')}>{loading ? '...' : share}</p>
              <p className={[
                'mt-2 text-xs',
                connected ? 'text-voya-orange' : 'text-foreground/40',
              ].join(' ')}>
                {connected && <span className="inline-block h-1.5 w-1.5 rounded-full bg-voya-orange mr-1.5 align-middle" />}
                {status}
              </p>
            </Panel>
          );
        })}
      </div>

      <Panel title="Cross-model coverage" hint="Per prompt" className="mt-5">
        <div className="overflow-hidden rounded-xl border border-border">
          <div className="grid grid-cols-12 gap-3 px-4 py-2.5 bg-secondary/60 text-[11px] uppercase tracking-widest text-muted-foreground">
            <div className="col-span-5">Prompt</div>
            {MODEL_ORDER.map((mid) => (
              <div key={mid} className="col-span-1 text-center">{mid === 'gpt4o' ? 'GPT' : MODEL_META[mid].label.split(' ')[0]}</div>
            ))}
            <div className="col-span-2 text-right">Coverage</div>
          </div>
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="grid grid-cols-12 gap-3 px-4 py-4 border-t border-border items-center">
                <div className="col-span-5 h-3 rounded bg-secondary/70" />
                {MODEL_ORDER.map((__, j) => (
                  <div key={j} className="col-span-1 flex justify-center">
                    <span className="h-3 w-3 rounded-full bg-secondary" />
                  </div>
                ))}
                <div className="col-span-2 flex justify-end">
                  <span className="h-3 w-16 rounded-full bg-secondary" />
                </div>
              </div>
            ))
          ) : (
            Array.from(allPromptIds).map(([pid, ptext]) => {
              let modelsCited = 0;
              return (
                <div key={pid} className="grid grid-cols-12 gap-3 px-4 py-3 border-t border-border items-center">
                  <div className="col-span-5 text-sm text-foreground/80 truncate" title={ptext}>{ptext}</div>
                  {MODEL_ORDER.map((mid) => {
                    const ms = shareMap.get(mid);
                    const pp = (ms?.per_prompt || []).find((p) => p.prompt_id === pid);
                    const voyaShare = pp?.shares['Voya'] || 0;
                    const connected = connectedIds.has(mid);
                    if (connected && voyaShare > 0) modelsCited++;
                    return (
                      <div key={mid} className="col-span-1 flex justify-center">
                        {!connected ? (
                          <span className="h-3 w-3 rounded-full bg-secondary/50" title="Not connected" />
                        ) : voyaShare > 0 ? (
                          <span className="h-5 w-5 rounded-full bg-voya-orange/20 flex items-center justify-center text-[9px] font-bold text-voya-orange" title={`${Math.round(voyaShare)}%`}>
                            {Math.round(voyaShare)}
                          </span>
                        ) : (
                          <span className="h-3 w-3 rounded-full bg-red-500/20 border border-red-500/30" title="0%" />
                        )}
                      </div>
                    );
                  })}
                  <div className="col-span-2 text-right text-xs text-muted-foreground">
                    {modelsCited}/{MODEL_ORDER.filter((m) => connectedIds.has(m)).length} models
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Panel>

      <div className="grid lg:grid-cols-2 gap-5 mt-5">
        <Panel title="Where Voya wins" hint="Cited on at least one model">
          {loading ? (
            <div className="h-[180px] flex items-center justify-center text-muted-foreground text-sm">Loading...</div>
          ) : voyaWins.length === 0 ? (
            <div className="h-[180px] flex items-center justify-center text-muted-foreground text-sm">No data yet</div>
          ) : (
            <div className="space-y-2 max-h-[220px] overflow-y-auto">
              {voyaWins.map((w, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg bg-voya-orange/5 border border-voya-orange/10 px-3 py-2">
                  <span className="mt-0.5 h-2 w-2 rounded-full bg-voya-orange shrink-0" />
                  <div>
                    <p className="text-sm text-foreground/80">{w.prompt}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Cited on: {w.models.map((m) => MODEL_META[m]?.label || m).join(', ')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
        <Panel title="Where Voya is invisible" hint="Zero coverage">
          {loading ? (
            <div className="h-[180px] flex items-center justify-center text-muted-foreground text-sm">Loading...</div>
          ) : voyaInvisible.length === 0 ? (
            <div className="h-[180px] flex items-center justify-center text-muted-foreground text-sm">Voya is cited on all tracked prompts</div>
          ) : (
            <div className="space-y-2 max-h-[220px] overflow-y-auto">
              {voyaInvisible.map((w, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg bg-red-500/5 border border-red-500/10 px-3 py-2">
                  <span className="mt-0.5 h-2 w-2 rounded-full bg-red-500/60 shrink-0" />
                  <p className="text-sm text-foreground/60">{w.prompt}</p>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </>
  );
}
