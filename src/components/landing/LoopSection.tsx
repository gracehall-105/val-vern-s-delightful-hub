const steps = [
  {
    label: "Measure",
    color: "var(--voya-orange)",
    title: "Every day at 7:30 AM, we ask the questions.",
    body: "Ten retirement questions go to GPT-4o, and we record which companies get cited. Share of Model tracks Voya's percentage over a 12-week trend.",
  },
  {
    label: "Create",
    color: "var(--voya-orange-light)",
    title: "The system identifies gaps and drafts.",
    body: "Targeted articles weekly — structured for AI consumption, not just human readers. Marketing reviews and approves before anything goes live.",
  },
  {
    label: "Prove",
    color: "var(--voya-purple)",
    title: "The next cycle closes the loop.",
    body: "We check whether Voya got cited where it wasn't before. No guessing. The content footprint — and the citations — compound over time.",
  },
];

export function LoopSection() {
  return (
    <section id="loop" className="relative py-24 md:py-32 bg-background">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-[0.2em] text-voya-orange font-semibold">How it works</p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-medium leading-tight">
            The Loop: Measure → Create → Prove
          </h2>
          <p className="mt-4 text-lg text-foreground/70 leading-relaxed">
            A closed-loop system that fixes the content architecture problem.
            No ad spend will get Voya into AI answers. Better content will.
          </p>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <article
              key={s.label}
              className="group relative rounded-3xl bg-card p-8 shadow-card border border-border/60 hover:border-voya-orange/40 hover:-translate-y-1 transition-all"
            >
              <div className="flex items-center justify-between">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full font-display text-xl font-semibold text-white"
                  style={{ background: s.color }}
                >
                  {i + 1}
                </div>
                <span
                  className="text-[11px] uppercase tracking-[0.2em] font-semibold"
                  style={{ color: s.color }}
                >
                  {s.label}
                </span>
              </div>
              <h3 className="mt-6 font-display text-2xl font-medium leading-snug">{s.title}</h3>
              <p className="mt-3 text-foreground/70 leading-relaxed">{s.body}</p>
              <div
                className="mt-8 h-1 w-12 rounded-full transition-all group-hover:w-24"
                style={{ background: s.color }}
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
