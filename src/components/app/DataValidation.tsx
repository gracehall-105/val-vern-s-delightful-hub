import { useState, useEffect } from 'react';
import { ShieldCheck, AlertCircle, Download, FileText, ArrowLeft, Loader2 } from 'lucide-react';
import { API_BASE } from '../lib/api';
import { VoyaLogo } from './landing/VoyaLogo';
import { Panel } from './AppShell';

interface Props {
  onBack: () => void;
}

export function DataValidation({ onBack }: Props) {
  const [validation, setValidation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/intelligence/validation`)
      .then((r) => r.json())
      .then((data) => { if (data?.validation) setValidation(data.validation); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Header */}
      <header className="sticky top-0 z-30 h-16 bg-card/80 backdrop-blur border-b border-border flex items-center gap-4 px-5 md:px-8">
        <VoyaLogo height={20} />
        <div>
          <h1 className="font-display text-xl leading-none">Data Validation</h1>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground mt-1">Internal use only</p>
        </div>
        <div className="ml-auto">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </button>
        </div>
      </header>

      <main className="flex-1 p-5 md:p-8 max-w-[1400px] w-full mx-auto">
        {/* Intro */}
        <div className="max-w-3xl mb-8">
          <p className="text-[11px] uppercase tracking-[0.2em] text-voya-orange font-semibold">Adversarial Review</p>
          <h2 className="mt-2 font-display text-3xl md:text-4xl leading-tight">How we validate the data.</h2>
          <p className="mt-3 text-foreground/70 leading-relaxed">
            Every measurement run is challenged by a two-layer system: statistical confidence intervals expose precision limits, then an adversarial AI reviewer stress-tests the conclusions.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center h-48 text-muted-foreground text-sm gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading validation report…
          </div>
        )}

        {validation && (
          <div className="space-y-8">
            {/* Confidence badge */}
            <Panel>
              <div className="flex items-center gap-4">
                <div className={`h-16 w-16 rounded-2xl flex items-center justify-center ${
                  validation.overall_confidence >= 70 ? 'bg-emerald-500/15' :
                  validation.overall_confidence >= 50 ? 'bg-amber-500/15' :
                  'bg-red-500/15'
                }`}>
                  <ShieldCheck className={`h-8 w-8 ${
                    validation.overall_confidence >= 70 ? 'text-emerald-500' :
                    validation.overall_confidence >= 50 ? 'text-amber-500' :
                    'text-red-500'
                  }`} />
                </div>
                <div>
                  <p className="font-display text-4xl font-bold">{validation.overall_confidence}%</p>
                  <p className="text-sm text-muted-foreground">Overall Confidence Score</p>
                </div>
                <div className="ml-auto text-right text-sm text-muted-foreground">
                  <p>{validation.statistical?.total_batches} measurement runs</p>
                  <p>{validation.statistical?.total_prompts} prompts tracked</p>
                  {validation.statistical?.model_versions?.length > 0 && (
                    <p>{validation.statistical.model_versions[0]}</p>
                  )}
                </div>
              </div>
            </Panel>

            {/* Company confidence intervals */}
            {validation.statistical?.company_stats?.length > 0 && (
              <Panel title="Company Share ± 95% Confidence Interval" hint="Statistical layer">
                <div className="space-y-3">
                  {validation.statistical.company_stats.map((cs: any) => (
                    <div key={cs.company} className="flex items-center gap-4">
                      <span className="w-28 text-sm font-medium text-foreground truncate">{cs.company}</span>
                      <div className="flex-1 h-3 bg-foreground/[0.05] rounded-full relative">
                        <div
                          className="absolute h-3 rounded-full bg-foreground/10"
                          style={{ left: `${cs.ci95_lower}%`, width: `${Math.max(1, cs.ci95_upper - cs.ci95_lower)}%` }}
                        />
                        <div
                          className={`absolute h-3 w-1.5 rounded-full ${
                            cs.company === 'Voya' ? 'bg-voya-orange' : 'bg-foreground/40'
                          }`}
                          style={{ left: `${cs.share_pct}%` }}
                        />
                      </div>
                      <span className="w-36 text-sm text-muted-foreground text-right">
                        {cs.share_pct}% <span className="text-foreground/40">({cs.ci95_lower}–{cs.ci95_upper}%)</span>
                      </span>
                      <span className={`w-16 text-right text-sm font-medium ${
                        cs.confidence === 'high' ? 'text-emerald-500' :
                        cs.confidence === 'medium' ? 'text-amber-500' : 'text-red-500'
                      }`}>{cs.confidence}</span>
                    </div>
                  ))}
                </div>
              </Panel>
            )}

            {/* Methodology risks */}
            {validation.methodology_risks?.length > 0 && (
              <Panel title="Methodology Risks" hint="Known limitations">
                <div className="space-y-2.5">
                  {validation.methodology_risks.map((risk: string, i: number) => (
                    <p key={i} className="text-sm text-foreground/75 flex items-start gap-3 leading-relaxed">
                      <AlertCircle size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
                      {risk}
                    </p>
                  ))}
                </div>
              </Panel>
            )}

            {/* Prompt Transparency */}
            {validation.prompt_transparency && (
              <Panel title="Prompt Transparency" hint="Full disclosure">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-foreground/70">
                      <FileText size={14} className="inline mr-2 text-foreground/40" />
                      {validation.prompt_transparency.total_active} active prompts · System prompt and methodology disclosed below
                    </p>
                    <a
                      href={`${API_BASE}/som/prompts/export`}
                      download="voya-som-prompts.json"
                      className="flex items-center gap-1.5 text-xs font-medium text-voya-orange hover:text-voya-orange/80 transition-colors"
                    >
                      <Download size={12} />
                      Download Full Prompt Set
                    </a>
                  </div>

                  {validation.prompt_transparency.stability_note && (
                    <p className="text-sm text-foreground/60 italic">
                      {validation.prompt_transparency.stability_note}
                    </p>
                  )}

                  {validation.prompt_transparency.unstable_count > 0 && (
                    <div>
                      <p className="text-xs font-medium text-amber-500 mb-2">
                        Unstable Prompts ({validation.prompt_transparency.unstable_count} — top company flips between runs):
                      </p>
                      <div className="max-h-48 overflow-y-auto space-y-1 rounded-lg bg-foreground/[0.02] p-3">
                        {validation.prompt_transparency.prompts
                          ?.filter((p: any) => !p.stable)
                          .slice(0, 15)
                          .map((p: any) => (
                            <div key={p.id} className="flex items-center gap-3 text-xs">
                              <span className="text-red-400/70 font-mono">⚡{p.flip_count}</span>
                              <span className="text-foreground/60 truncate flex-1">{p.text}</span>
                              <span className="text-foreground/40 flex-shrink-0">{p.top_companies?.join(' / ')}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  <details className="mt-2">
                    <summary className="text-xs text-foreground/40 cursor-pointer hover:text-foreground/60">
                      Show system prompt used for measurements
                    </summary>
                    <pre className="mt-2 text-xs text-foreground/50 bg-foreground/[0.03] rounded-lg p-4 whitespace-pre-wrap leading-relaxed">
                      {validation.prompt_transparency.system_prompt}
                    </pre>
                  </details>
                </div>
              </Panel>
            )}

            {/* Adversarial review */}
            {validation.adversarial_review && (
              <Panel title="Adversarial Review" hint="GPT-4o skeptical reviewer">
                <p className="text-sm text-foreground/75 leading-relaxed whitespace-pre-line">{validation.adversarial_review}</p>
              </Panel>
            )}
          </div>
        )}

        {/* Not loaded / empty */}
        {!loading && !validation && (
          <Panel>
            <div className="text-center py-12">
              <ShieldCheck className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground/70">No validation data yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Run a measurement cycle to generate the adversarial validation report.
              </p>
            </div>
          </Panel>
        )}

        <div className="mt-10 flex flex-wrap gap-3">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-voya text-white px-5 py-2.5 text-sm font-medium shadow-soft cursor-pointer"
          >
            Back to Dashboard <ArrowLeft className="h-4 w-4" />
          </button>
        </div>
      </main>
    </div>
  );
}
