const does = [
  "Measures Voya's Share of Model in AI answers, every day.",
  "Drafts six AI-optimized articles a week, targeted at gap topics.",
  "Tracks edit history so the system gets smarter from your team's corrections.",
  "Surfaces the prompts and competitors that matter — no noise.",
];
const doesnt = [
  "Publish anything without a human review.",
  "Replace your editorial judgment.",
  "Promise a citation — it improves the probability.",
  "Cover non-retirement topics in Phase 1.",
];

export function DoesDoesnt() {
  return (
    <section className="py-24 md:py-32 bg-secondary/40">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-[0.2em] text-voya-orange font-semibold">The honest version</p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-medium leading-tight">
            What it does. And what it doesn't.
          </h2>
        </div>
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <div className="rounded-3xl bg-card border border-border p-8 shadow-card">
            <p className="font-display text-2xl text-voya-orange">It does</p>
            <ul className="mt-6 space-y-4">
              {does.map((d) => (
                <li key={d} className="flex gap-3 text-foreground/80">
                  <span
                    aria-hidden
                    className="mt-1.5 inline-block h-2 w-2 rounded-full bg-voya-orange flex-none"
                  />
                  <span className="leading-relaxed">{d}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl bg-card border border-border p-8 shadow-card">
            <p className="font-display text-2xl" style={{ color: "var(--voya-purple)" }}>It doesn't</p>
            <ul className="mt-6 space-y-4">
              {doesnt.map((d) => (
                <li key={d} className="flex gap-3 text-foreground/80">
                  <span
                    aria-hidden
                    className="mt-1.5 inline-block h-2 w-2 rounded-full flex-none"
                    style={{ background: "var(--voya-purple)" }}
                  />
                  <span className="leading-relaxed">{d}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
