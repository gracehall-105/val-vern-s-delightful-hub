import { createFileRoute } from "@tanstack/react-router";
import { PageIntro, Panel, Placeholder } from "@/components/app/AppShell";

export const Route = createFileRoute("/app/models")({
  component: Models,
});

const models = [
  { name: "ChatGPT (GPT-4o)", share: "—%", status: "Live" },
  { name: "Claude", share: "—%", status: "Live" },
  { name: "Gemini", share: "—%", status: "Live" },
  { name: "Perplexity", share: "—%", status: "Live" },
  { name: "Copilot", share: "—%", status: "Beta" },
];

function Models() {
  return (
    <>
      <PageIntro
        phase={2}
        eyebrow="Measure · Multi-model"
        title="Which model is hardest to crack?"
        lede="Run the same prompt across every model that matters. See where Voya appears on one and not another, and prioritize the platforms with the biggest gaps."
      />

      <div className="grid lg:grid-cols-5 gap-4">
        {models.map((m) => (
          <Panel key={m.name}>
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{m.name}</p>
            <p className="mt-3 font-display text-4xl leading-none">{m.share}</p>
            <p className="mt-2 text-xs text-foreground/60">{m.status}</p>
          </Panel>
        ))}
      </div>

      <Panel title="Cross-model coverage" hint="Per prompt" className="mt-5">
        <div className="overflow-hidden rounded-xl border border-border">
          <div className="grid grid-cols-12 gap-3 px-4 py-2.5 bg-secondary/60 text-[11px] uppercase tracking-widest text-muted-foreground">
            <div className="col-span-5">Prompt</div>
            <div className="col-span-1 text-center">GPT</div>
            <div className="col-span-1 text-center">Claude</div>
            <div className="col-span-1 text-center">Gemini</div>
            <div className="col-span-1 text-center">Perplexity</div>
            <div className="col-span-1 text-center">Copilot</div>
            <div className="col-span-2 text-right">Coverage</div>
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="grid grid-cols-12 gap-3 px-4 py-4 border-t border-border items-center">
              <div className="col-span-5 h-3 rounded bg-secondary/70" />
              {Array.from({ length: 5 }).map((__, j) => (
                <div key={j} className="col-span-1 flex justify-center">
                  <span className="h-3 w-3 rounded-full bg-secondary" />
                </div>
              ))}
              <div className="col-span-2 flex justify-end">
                <span className="h-3 w-16 rounded-full bg-secondary" />
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid lg:grid-cols-2 gap-5 mt-5">
        <Panel title="Where Voya wins" hint="Strongest model">
          <Placeholder label="Prompts where Voya appears on at least one model" height={180} />
        </Panel>
        <Panel title="Where Voya is invisible" hint="Zero-coverage prompts">
          <Placeholder label="Prompts missing across all tracked models — top brief candidates" height={180} />
        </Panel>
      </div>
    </>
  );
}
