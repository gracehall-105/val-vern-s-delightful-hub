import { TrendingUp, AlertCircle } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import type { CompetitiveSignal } from "@/lib/queries";

interface CompetitiveContentCardProps {
  signals: CompetitiveSignal[];
  loading: boolean;
  error?: string;
}

export function CompetitiveContentCard({
  signals,
  loading,
  error,
}: CompetitiveContentCardProps) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="rounded-2xl bg-card border border-border shadow-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-bold text-foreground">
            Competitive content moves this week
          </h3>
          <TrendingUp size={20} className="text-voya-orange" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-foreground/5 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-card border border-border shadow-card p-6">
        <div className="flex items-start gap-3">
          <AlertCircle size={20} className="text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-display font-bold text-foreground">
              Competitive content moves this week
            </h3>
            <p className="text-sm text-foreground/60 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const sortedSignals = [...signals]
    .sort((a, b) => b.share_delta_pct - a.share_delta_pct)
    .slice(0, 5);

  return (
    <div className="rounded-2xl bg-card border border-border shadow-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
            <TrendingUp size={20} className="text-voya-orange" />
            Competitive content moves this week
          </h3>
          <p className="text-sm text-foreground/60 mt-1">
            {sortedSignals.length} move{sortedSignals.length !== 1 ? "s" : ""} detected
          </p>
        </div>
      </div>

      {sortedSignals.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm text-foreground/60">
            No significant competitive moves detected this week
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedSignals.map((signal, idx) => (
            <div
              key={idx}
              className="p-4 rounded-lg bg-foreground/[0.02] border border-border/50 hover:border-voya-orange/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-foreground text-sm">{signal.competitor}</h4>
                  <p className="text-xs text-foreground/60 mt-1">{signal.content_topic}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div
                    className={`text-lg font-bold ${
                      signal.share_delta_pct > 0 ? "text-red-500" : "text-green-500"
                    }`}
                  >
                    {signal.share_delta_pct > 0 ? "+" : ""}
                    {signal.share_delta_pct.toFixed(1)}%
                  </div>
                </div>
              </div>

              {signal.example_citations.length > 0 && (
                <div className="mt-2 pt-2 border-t border-border/30">
                  <p className="text-xs text-foreground/60 mb-1">Source:</p>
                  <a
                    href={signal.example_citations[0].url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-voya-orange hover:underline truncate block"
                  >
                    {signal.example_citations[0].source}
                  </a>
                </div>
              )}

              {signal.executive_summary && (
                <div className="mt-3 text-xs text-foreground/70 leading-relaxed">
                  {signal.executive_summary}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-border/30">
        <button
          onClick={() => navigate({ to: "/app/prove" })}
          className="text-xs font-medium text-voya-orange hover:underline"
        >
          View market trends in full →
        </button>
      </div>
    </div>
  );
}

export default CompetitiveContentCard;
