import { createFileRoute } from "@tanstack/react-router";
import { PageIntro, Panel, Placeholder } from "@/components/app/AppShell";

export const Route = createFileRoute("/app/listen")({
  component: Listen,
});

const sources = [
  { name: "Genesys call transcripts", status: "Connected", count: "—" },
  { name: "Qualtrics / NPS verbatims", status: "Connected", count: "—" },
  { name: "Chatbot transcripts", status: "Connected", count: "—" },
  { name: "Advisor field notes", status: "Pending", count: "—" },
];

function Listen() {
  return (
    <>
      <PageIntro
        phase={2}
        eyebrow="Listen · VoC Listening Post"
        title="What customers are actually asking — in their own words."
        lede="Replace prompt guessing with real demand. Pull questions from voice, survey, and chat channels, cluster them by intent, and promote the strongest ones into Measure."
      />

      <div className="grid lg:grid-cols-4 gap-5">
        {[
          { k: "Verbatims this week", v: "—" },
          { k: "Distinct questions", v: "—" },
          { k: "New intent clusters", v: "—" },
          { k: "Promoted to Measure", v: "—" },
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
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 rounded-xl border border-border bg-background p-4">
                <div className="flex-1">
                  <div className="h-3 w-3/4 rounded bg-secondary" />
                  <div className="mt-2 flex gap-2">
                    <span className="h-4 w-16 rounded-full bg-secondary/70" />
                    <span className="h-4 w-20 rounded-full bg-secondary/70" />
                  </div>
                </div>
                <button className="text-xs text-voya-orange font-medium whitespace-nowrap">
                  Promote → Measure
                </button>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Connected sources">
          <ul className="space-y-3">
            {sources.map((s) => (
              <li key={s.name} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.count} new · {s.status}</p>
                </div>
                <span
                  className={`h-2 w-2 rounded-full ${
                    s.status === "Connected" ? "bg-voya-orange" : "bg-muted-foreground/40"
                  }`}
                />
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel title="Intent clusters" hint="Auto-grouped" className="mt-5">
        <Placeholder label="Topic map — bubbles sized by volume, colored by sentiment" height={220} />
      </Panel>
    </>
  );
}
