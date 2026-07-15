/**
 * ActivationPanel — Minimal insights-to-activation flow.
 * insight → content → review → destination → publish.
 */

import { useState, useEffect } from "react";
import { X, ExternalLink, FileText, Check, ChevronRight, Globe, Edit3 } from "lucide-react";
import { API_BASE } from "@/lib/api";
import type { GeneratedContent } from "@/lib/queries";

interface ActivationPanelProps {
  prompt: string;
  promptId: string;
  voyaShare: number;
  onClose: () => void;
}

export function ActivationPanel({ prompt, promptId, voyaShare, onClose }: ActivationPanelProps) {
  const [phase, setPhase] = useState<"loading" | "review" | "confirmed" | "empty">("loading");
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [selectedDest, setSelectedDest] = useState<string | null>(null);
  const [showArticle, setShowArticle] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadContent() {
      try {
        const res = await fetch(`${API_BASE}/content/activate?prompt_id=${promptId}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (cancelled) return;
        setContent(data.content);
        setSelectedDest(data.content?.destinations?.[0]?.id ?? null);
        setPhase("review");
      } catch {
        if (cancelled) return;
        setContent(null);
        setPhase("empty");
      }
    }
    loadContent();
    return () => {
      cancelled = true;
    };
  }, [promptId]);

  const selectedDestination = content?.destinations?.find((d) => d.id === selectedDest);

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="absolute right-0 top-0 bottom-0 w-full sm:w-[520px] bg-card border-l border-border shadow-2xl overflow-y-auto animate-fade-up">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-card/95 backdrop-blur border-b border-border p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-destructive mb-1">
                Gap: Voya {Math.round(voyaShare)}%
              </p>
              <h3 className="font-display text-sm font-bold text-foreground leading-snug">
                {prompt}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center hover:bg-secondary/70 transition-all"
            >
              <X size={14} className="text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="p-5">
          {phase === "loading" && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-voya-orange border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-xs text-muted-foreground">Generating content recommendation…</p>
            </div>
          )}

          {phase === "review" && content && (
            <div className="space-y-5">
              <div className="rounded-xl border border-border bg-background/60 p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-voya-orange/10 flex items-center justify-center flex-shrink-0">
                    <FileText size={14} className="text-voya-orange" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-foreground leading-snug">
                      {content.title}
                    </h4>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {content.word_count} words · {content.faq_count} FAQs ·{" "}
                      {content.schema_types.join(" + ")} schema
                    </p>
                  </div>
                </div>

                <p className="text-xs text-foreground/70 leading-relaxed mb-3">
                  {content.meta_description}
                </p>

                <button
                  onClick={() => setShowArticle(!showArticle)}
                  className="text-[10px] text-voya-orange font-medium hover:underline flex items-center gap-1"
                >
                  <Edit3 size={10} />
                  {showArticle ? "Hide article" : "Review & edit article"}
                </button>

                {showArticle && (
                  <div className="mt-3 p-4 rounded-lg bg-secondary/40 border border-border max-h-[250px] overflow-y-auto">
                    <div
                      className="prose prose-sm max-w-none text-[11px] leading-relaxed [&_h2]:text-sm [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:mt-4 [&_h2]:mb-2 [&_p]:text-foreground/70 [&_li]:text-foreground/70 [&_strong]:text-foreground"
                      dangerouslySetInnerHTML={{ __html: content.body_html }}
                    />
                  </div>
                )}
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Where to publish
                </p>
                <p className="text-[10px] text-muted-foreground mb-3">
                  Based on where AI engines actually pull answers from for this topic.
                </p>

                <div className="space-y-2">
                  {content.destinations.map((dest) => (
                    <button
                      key={dest.id}
                      onClick={() => setSelectedDest(dest.id)}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${
                        selectedDest === dest.id
                          ? "border-voya-orange bg-voya-orange/10"
                          : "border-border bg-background/40 hover:border-voya-orange/40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Globe
                            size={14}
                            className={
                              selectedDest === dest.id ? "text-voya-orange" : "text-muted-foreground"
                            }
                          />
                          <div>
                            <span className="text-xs font-semibold text-foreground">{dest.name}</span>
                            {dest.type === "recommended" && (
                              <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-medium">
                                Recommended
                              </span>
                            )}
                          </div>
                        </div>
                        {selectedDest === dest.id && (
                          <Check size={14} className="text-voya-orange" />
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1 ml-[26px]">{dest.why}</p>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setPhase("confirmed")}
                className="w-full py-3 text-sm font-semibold flex items-center justify-center gap-2 rounded-xl bg-gradient-voya text-white hover:opacity-90 transition-opacity"
              >
                Publish to {selectedDestination?.name || "selected platform"}
                <ChevronRight size={14} />
              </button>
              <p className="text-[9px] text-muted-foreground text-center">
                You'll review final formatting before it goes live.
              </p>
            </div>
          )}

          {phase === "confirmed" && content && (
            <div className="py-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                <Check size={24} className="text-emerald-600" />
              </div>
              <h3 className="font-display text-base font-bold text-foreground mb-2">
                Queued for publishing
              </h3>
              <p className="text-xs text-foreground/70 mb-6 max-w-[300px] mx-auto">
                "{content.title}" will be published to{" "}
                <strong>{selectedDestination?.name}</strong> after your final review.
              </p>

              <div className="rounded-xl border border-border bg-background/60 p-4 text-left mb-6">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-xs text-foreground/70">
                    <Check size={12} className="text-emerald-600 flex-shrink-0" />
                    <span>Content optimized for AI citation</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-foreground/70">
                    <Check size={12} className="text-emerald-600 flex-shrink-0" />
                    <span>Schema markup attached ({content.schema_types.join(" + ")})</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-foreground/70">
                    <Check size={12} className="text-emerald-600 flex-shrink-0" />
                    <span>Compliance pre-cleared</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-foreground/70">
                    <ExternalLink size={12} className="text-voya-orange flex-shrink-0" />
                    <span>
                      Destination: <strong>{selectedDestination?.name}</strong>
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="px-6 py-2.5 text-xs font-semibold rounded-xl bg-gradient-voya text-white hover:opacity-90 transition-opacity"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getFallbackContent(): GeneratedContent {
  return {
    title: "How to roll over your 401(k) to an IRA",
    slug: "retirement/how-to-roll-over-401k-to-ira",
    meta_description:
      "Learn how to roll over your 401(k) to an IRA step by step. Understand direct vs indirect rollovers, tax rules, and timeline after leaving your job.",
    body_html: `<h2>How to roll over your 401(k) to an IRA</h2>
<p>When you leave a job, you typically have 60 days to decide what to do with your 401(k). Rolling it over to an IRA is one of the most common choices.</p>
<h2>Direct vs. indirect rollover</h2>
<p><strong>Direct rollover (recommended):</strong> Funds transfer institution-to-institution. No withholding, no 60-day deadline.</p>
<p><strong>Indirect rollover:</strong> You receive a check with 20% withheld; must redeposit within 60 days.</p>`,
    word_count: 1150,
    faq_count: 5,
    compliance_notes: "No performance guarantees • 'Consult advisor' present • No absolute claims",
    target_keywords: ["401k to IRA rollover", "direct rollover", "rollover IRA"],
    schema_types: ["Article", "FAQPage"],
    destinations: [
      {
        id: "reddit",
        name: "Reddit r/personalfinance",
        why: "GPT-4o cites Reddit threads for this query 34% of the time",
        url: "https://reddit.com/r/personalfinance",
        type: "recommended",
      },
      {
        id: "linkedin",
        name: "LinkedIn Article",
        why: "Professional finance content gets cited in Copilot answers",
        url: "https://linkedin.com",
        type: "alternative",
      },
      {
        id: "voya",
        name: "Voya.com Blog",
        why: "Builds domain authority over time; low immediate AI citation rate",
        url: "https://voya.com/blog",
        type: "alternative",
      },
    ],
  };
}
