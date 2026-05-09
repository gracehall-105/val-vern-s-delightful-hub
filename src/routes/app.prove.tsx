import { createFileRoute } from "@tanstack/react-router";
import { PageIntro, Panel, Placeholder } from "@/components/app/AppShell";

export const Route = createFileRoute("/app/prove")({
  component: Prove,
});

function Prove() {
  return (
    <>
      <PageIntro
        eyebrow="Prove"
        title="Did the work move the needle?"
        lede="Before / after share lift on every published brief, plus a leadership-ready summary you can export."
      />

      <div className="grid lg:grid-cols-3 gap-5">
        <Panel>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Briefs measured</p>
          <p className="mt-3 font-display text-5xl leading-none">—</p>
          <p className="mt-2 text-xs text-foreground/60">Last 90 days</p>
        </Panel>
        <Panel>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Avg. share lift</p>
          <p className="mt-3 font-display text-5xl text-voya-orange leading-none">+—pp</p>
          <p className="mt-2 text-xs text-foreground/60">Pre vs. post-publish</p>
        </Panel>
        <Panel>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Win rate</p>
          <p className="mt-3 font-display text-5xl leading-none">—%</p>
          <p className="mt-2 text-xs text-foreground/60">Briefs with positive lift</p>
        </Panel>
      </div>

      <Panel title="Lift by brief" hint="Sorted by impact" className="mt-5">
        <div className="overflow-hidden rounded-xl border border-border">
          <div className="grid grid-cols-12 gap-3 px-4 py-2.5 bg-secondary/60 text-[11px] uppercase tracking-widest text-muted-foreground">
            <div className="col-span-5">Brief</div>
            <div className="col-span-2">Published</div>
            <div className="col-span-2">Pre share</div>
            <div className="col-span-2">Post share</div>
            <div className="col-span-1 text-right">Δ</div>
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="grid grid-cols-12 gap-3 px-4 py-4 border-t border-border items-center">
              <div className="col-span-5 h-3 rounded bg-secondary/70" />
              <div className="col-span-2 h-3 rounded bg-secondary/60 w-2/3" />
              <div className="col-span-2 h-3 rounded bg-secondary/60 w-1/2" />
              <div className="col-span-2 h-3 rounded bg-secondary/60 w-1/2" />
              <div className="col-span-1 flex justify-end">
                <span className="h-5 w-10 rounded bg-voya-orange/15" />
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid lg:grid-cols-2 gap-5 mt-5">
        <Panel title="Leadership summary" hint="Auto-drafted">
          <Placeholder label="Narrative export — what we did, what moved, what's next" height={200} />
        </Panel>
        <Panel title="Export" hint="One-click">
          <div className="flex flex-col gap-2">
            {["Quarterly board deck (PDF)", "CMO weekly (PDF)", "Raw data (CSV)"].map((x) => (
              <button
                key={x}
                className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3 text-sm text-left hover:border-voya-orange/40"
              >
                <span>{x}</span>
                <span className="text-voya-orange">↓</span>
              </button>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}
