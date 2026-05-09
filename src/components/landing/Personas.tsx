const personas = [
  {
    role: "CMO / SVP Marketing",
    need: "A dashboard that shows Voya's competitive position in AI answers — with the week-over-week trends to back the story up.",
  },
  {
    role: "Content Marketing Team",
    need: "Pre-drafted, AI-optimized articles ready to refine and publish. No more blank-page Mondays.",
  },
  {
    role: "Digital Strategy",
    need: "The data on which retirement topics Voya is invisible for, and exactly where to point next quarter's effort.",
  },
];

export function Personas() {
  return (
    <section id="personas" className="py-24 md:py-32 bg-background">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-[0.2em] text-voya-orange font-semibold">Who it's for</p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-medium leading-tight">
            Three teams. One source of truth.
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
