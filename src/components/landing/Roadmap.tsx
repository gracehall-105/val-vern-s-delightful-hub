import { Butterfly } from "./Butterfly";

const items = [
  {
    title: "Voice of Customer Listening Post",
    body: "Replace prompt guessing with real questions from Genesys, Qualtrics/NPS, and chatbot transcripts. Same architecture, sharper signal.",
  },
  {
    title: "Content Scoring",
    body: "Bring any draft — blog, landing page, whitepaper. The system scores its AI findability and tells you what to change before publish.",
  },
  {
    title: "Multi-Model Measurement",
    body: "Expand beyond GPT-4o to Claude, Gemini, and Perplexity. See where Voya appears on one model but not another.",
  },
];

export function Roadmap() {
  return (
    <section id="roadmap" className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-supergraphic" aria-hidden />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.15), transparent 40%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.12), transparent 40%)",
        }}
        aria-hidden
      />
      <Butterfly
        className="absolute right-[8%] top-[15%] animate-drift opacity-80"
        color="oklch(0.95 0.04 60)"
        size={36}
      />

      <div className="relative mx-auto max-w-7xl px-6 text-white">
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-[0.2em] font-semibold opacity-80">Phase 2 roadmap</p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-medium leading-tight">
            What's next, and why it matters.
          </h2>
          <p className="mt-4 text-lg text-white/80 leading-relaxed">
            Phase 1 proves the loop works. Phase 2 widens the lens —
            more signal sources, more models, more leverage for Marketing.
          </p>
        </div>
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {items.map((it) => (
            <div
              key={it.title}
              className="rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20 p-8 hover:bg-white/15 transition-colors"
            >
              <p className="font-display text-2xl font-medium">{it.title}</p>
              <p className="mt-3 text-white/80 leading-relaxed">{it.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
