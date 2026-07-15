import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageIntro } from "@/components/app/AppShell";
import { OpportunitySynthesis } from "@/components/app/OpportunitySynthesis";
import { OpportunityGapCalculator } from "@/components/app/OpportunityGapCalculator";
import { OpportunityGapCalculator as OpportunityForecast } from "@/components/app/OpportunityForecast";

export const Route = createFileRoute("/app/opportunities")({
  head: () => ({
    meta: [{ title: "Opportunities — Beacon" }],
  }),
  component: OpportunitiesRoute,
});

const TABS = [
  { key: "synthesis", label: "Synthesis" },
  { key: "gaps", label: "Gap calculator" },
  { key: "forecast", label: "Forecast" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function OpportunitiesRoute() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabKey>("synthesis");

  const onActivate = (topic: string, articleType?: string, rationale?: string, contentId?: number, targetGap?: string) => {
    navigate({
      to: "/app/create",
      search: { topic, articleType, rationale, contentId, targetGap } as any,
    });
  };

  return (
    <>
      <PageIntro
        eyebrow="Opportunities"
        title="Where to invest attention next."
        lede="Synthesized recommendations, quantified gaps, and forecast reach for the plays that will move share."
      />

      <div className="flex gap-2 mb-5">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={[
              "px-4 py-1.5 rounded-full text-xs font-medium border transition-colors",
              tab === t.key
                ? "bg-voya-orange text-white border-voya-orange"
                : "bg-card text-foreground/70 border-border hover:border-voya-orange/40",
            ].join(" ")}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "synthesis" && <OpportunitySynthesis onNavigate={onActivate as any} />}
      {tab === "gaps" && <OpportunityGapCalculator onActivate={onActivate as any} />}
      {tab === "forecast" && <OpportunityForecast />}
    </>
  );
}
