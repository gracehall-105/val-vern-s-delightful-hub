const steps = [
  {
    label: "Measure",
    color: "var(--voya-orange)",
    title: "Every morning, we ask the questions.",
    body: "Ten high-intent retirement prompts go to GPT-4o at 7:30 AM ET. We record which companies get cited. The result is your Share of Model — market share, but for AI answers.",
  },
  {
    label: "Create",
    color: "var(--voya-orange-light)",
    title: "Sunday mornings, the pipeline drafts.",
    body: "Where Voya is invisible but competitors aren't, the system writes targeted articles structured for AI to consume. Six per week, ready for your editor to refine.",
  },
  {
    label: "Prove",
    color: "var(--voya-purple)",
    title: "Next cycle tells you if it worked.",
    body: "The next measurement checks whether new content moved the needle. Did Voya get cited where it wasn't before? The loop compounds, week over week.",
  },
];

export function LoopSection() {
  return (
    <section id="loop" className="relative py-24 md:py-32 bg-background">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-[0.2em] text-voya-orange font-semibold">The loop</p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-medium leading-tight">
            Measure, create, prove —<br /> on repeat.
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
