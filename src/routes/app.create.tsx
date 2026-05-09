import { createFileRoute } from "@tanstack/react-router";
import { PageIntro, Panel, Placeholder } from "@/components/app/AppShell";

export const Route = createFileRoute("/app/create")({
  component: Create,
});

const columns = [
  { key: "idea", label: "Idea", count: "—" },
  { key: "brief", label: "Briefed", count: "—" },
  { key: "draft", label: "Drafted", count: "—" },
  { key: "review", label: "In review", count: "—" },
  { key: "live", label: "Published", count: "—" },
];

function Create() {
  return (
    <>
      <PageIntro
        eyebrow="Create"
        title="Turn gaps into briefs into published answers."
        lede="Every item starts from a measured gap, runs through Marketing review, and gets tracked back to share."
      />

      <div className="flex items-center justify-between mb-5">
        <div className="flex gap-2 text-xs">
          <button className="px-3 py-1.5 rounded-full bg-voya-orange text-white">My queue</button>
          <button className="px-3 py-1.5 rounded-full bg-card border border-border text-foreground/70">
            All work
          </button>
          <button className="px-3 py-1.5 rounded-full bg-card border border-border text-foreground/70">
            Archived
          </button>
        </div>
        <button className="inline-flex items-center gap-2 rounded-full bg-gradient-voya text-white px-4 py-2 text-sm font-medium shadow-soft">
          + New brief from gap
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {columns.map((c) => (
          <div key={c.key} className="rounded-2xl bg-card border border-border p-3 min-h-[420px]">
            <div className="flex items-center justify-between px-2 pb-3 border-b border-border">
              <p className="text-xs font-semibold uppercase tracking-widest text-foreground/70">
                {c.label}
              </p>
              <span className="text-[11px] text-muted-foreground">{c.count}</span>
            </div>
            <div className="mt-3 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-border bg-background p-3">
                  <div className="h-2.5 w-3/4 rounded bg-secondary" />
                  <div className="mt-2 h-2 w-1/2 rounded bg-secondary/70" />
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      —
                    </span>
                    <div className="h-5 w-5 rounded-full bg-gradient-voya" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Panel title="Brief preview" hint="Select a card" className="mt-5">
        <Placeholder label="Brief detail — gap source, target prompt, key proof points, owner, due date" height={180} />
      </Panel>
    </>
  );
}
