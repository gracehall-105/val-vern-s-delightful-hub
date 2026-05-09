const personas = [
  {
    role: "CMO / SVP Marketing",
    need: "A single dashboard showing Voya's competitive position in AI answers, with week-over-week trends and an AI-generated analyst report. One number tells the board how visible we are.",
  },
  {
    role: "Content Marketing",
    need: "Pre-drafted, AI-optimized articles ready for review — no blank-page problem. Edit inline, approve, and publish. The system learns from your corrections over time.",
  },
  {
    role: "Digital Strategy",
    need: "Data on which retirement topics Voya is invisible for and where to focus. See which competitor dominates each prompt and where content investment will move the needle.",
  },
  {
    role: "Investment Management",
    need: "Retail investors researching rollovers and IRAs get Fidelity/Vanguard cited 6–7 out of 10 times. Voya: zero.",
  },
  {
    role: "Workplace Solutions",
    need: "\"Best 401k provider for small business\" returns Guideline, Human Interest, Fidelity — not Voya. Impacts plan acquisition, participant retention, and rollover capture.",
  },
];

export function Personas() {
  return (
    <section id="personas" className="py-24 md:py-32 bg-background">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-[0.2em] text-voya-orange font-semibold">Who it's for</p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-medium leading-tight">
            Built for the people who own the brand.
          </h2>
        </div>
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {personas.map((p) => (
            <div
              key={p.role}
              className="rounded-3xl border border-border bg-card p-8 hover:shadow-soft transition-shadow"
            >
              <p className="font-display text-xl font-medium text-voya-orange">{p.role}</p>
              <p className="mt-4 text-foreground/75 leading-relaxed">{p.need}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
