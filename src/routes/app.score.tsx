import { createFileRoute } from "@tanstack/react-router";
import { PageIntro, Panel, Placeholder } from "@/components/app/AppShell";

export const Route = createFileRoute("/app/score")({
  component: Score,
});

const checks = [
  "Direct answer to the target prompt",
  "Voya named in first 100 words",
  "Cites authoritative proof points",
  "Schema / structured data present",
  "Reading level matches model preference",
  "Competitor mentions handled cleanly",
];

function Score() {
  return (
    <>
      <PageIntro
        phase={2}
        eyebrow="Create · Content scoring"
        title="Will this content get Voya cited?"
        lede="Paste any draft — blog, landing page, whitepaper. The system scores AI findability before publish and tells Marketing exactly what to change."
      />

      <div className="grid lg:grid-cols-3 gap-5">
        <Panel className="lg:col-span-2" title="Draft" hint="Paste or upload">
          <div className="rounded-xl border border-dashed border-border bg-background p-6 min-h-[280px] text-sm text-muted-foreground">
            Drop a .docx, paste a URL, or start typing your draft here…
          </div>
          <div className="mt-3 flex gap-2">
            <button className="rounded-full bg-gradient-voya text-white text-xs font-medium px-4 py-2">
              Score draft
            </button>
            <button className="rounded-full border border-border text-xs px-4 py-2">
              Upload .docx
            </button>
            <button className="rounded-full border border-border text-xs px-4 py-2">
              Paste URL
            </button>
          </div>
        </Panel>

        <Panel title="AI findability score">
          <div className="grid place-items-center py-4">
            <div className="relative h-32 w-32 rounded-full bg-secondary grid place-items-center">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: "conic-gradient(var(--voya-orange) 0deg, var(--secondary) 0deg)",
                }}
              />
              <div className="absolute inset-2 rounded-full bg-card grid place-items-center">
                <span className="font-display text-4xl">—</span>
              </div>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">Score draft to see result</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-[10px] uppercase tracking-widest text-muted-foreground">
            <div className="rounded-lg bg-secondary/60 py-2">Clarity<br /><span className="text-foreground">—</span></div>
            <div className="rounded-lg bg-secondary/60 py-2">Authority<br /><span className="text-foreground">—</span></div>
            <div className="rounded-lg bg-secondary/60 py-2">Structure<br /><span className="text-foreground">—</span></div>
          </div>
        </Panel>
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mt-5">
        <Panel title="Checks" hint="What we look for">
          <ul className="space-y-2">
            {checks.map((c) => (
              <li key={c} className="flex items-center gap-3 text-sm">
                <span className="h-4 w-4 rounded-full border border-border bg-background" />
                <span className="text-foreground/80">{c}</span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Suggested edits" hint="Highest impact first">
          <Placeholder label="Inline suggestions appear here after scoring" height={200} />
        </Panel>
      </div>
    </>
  );
}
