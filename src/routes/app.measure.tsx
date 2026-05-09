import { createFileRoute } from "@tanstack/react-router";
import { PageIntro, Panel, Placeholder } from "@/components/app/AppShell";

export const Route = createFileRoute("/app/measure")({
  component: Measure,
});

function Measure() {
  return (
    <>
      <PageIntro
        eyebrow="Measure"
        title="Where Voya shows up — and where it doesn't."
        lede="Tracked prompts across the models that matter, scored for presence, sentiment, and competitor share."
      />

      <div className="flex flex-wrap gap-2 mb-5">
        {["All categories", "Retirement", "Workplace benefits", "Investment products", "Brand"].map((t, i) => (
          <button
            key={t}
            className={[
              "px-3 py-1.5 rounded-full text-xs border",
              i === 0
                ? "bg-voya-orange text-white border-voya-orange"
                : "bg-card text-foreground/70 border-border hover:border-voya-orange/40",
            ].join(" ")}
          >
            {t}
          </button>
        ))}
        <div className="ml-auto flex gap-2">
          {["ChatGPT", "Claude", "Gemini", "Perplexity"].map((m) => (
            <span key={m} className="px-2.5 py-1 rounded-md text-[11px] bg-secondary text-foreground/70">
              {m}
            </span>
          ))}
        </div>
      </div>

      <Panel title="Prompt library" hint="0 of 0 shown">
        <div className="overflow-hidden rounded-xl border border-border">
          <div className="grid grid-cols-12 gap-3 px-4 py-2.5 bg-secondary/60 text-[11px] uppercase tracking-widest text-muted-foreground">
            <div className="col-span-5">Prompt</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-2">Voya present</div>
            <div className="col-span-2">Top competitor</div>
            <div className="col-span-1 text-right">Gap</div>
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-12 gap-3 px-4 py-4 border-t border-border items-center"
            >
              <div className="col-span-5 h-3 rounded bg-secondary/70" />
              <div className="col-span-2 h-3 rounded bg-secondary/60 w-2/3" />
              <div className="col-span-2 h-3 rounded bg-secondary/60 w-1/2" />
              <div className="col-span-2 h-3 rounded bg-secondary/60 w-2/3" />
              <div className="col-span-1 flex justify-end">
                <span className="h-5 w-8 rounded bg-secondary/70" />
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid lg:grid-cols-2 gap-5 mt-5">
        <Panel title="Gap distribution" hint="By category">
          <Placeholder label="Heatmap" height={200} />
        </Panel>
        <Panel title="Sample answer" hint="Click a prompt above">
          <Placeholder label="Model output preview with Voya / competitor highlights" height={200} />
        </Panel>
      </div>
    </>
  );
}
