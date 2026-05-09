import heroArt from "@/assets/val-vern-hero.png";
import { Butterfly } from "./Butterfly";
import { VoyaJourney } from "./VoyaJourney";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-sky">
      {/* Floating butterflies */}
      <Butterfly
        className="absolute left-[8%] top-[18%] animate-drift"
        color="var(--voya-orange)"
        size={42}
        style={{ animationDelay: "0s" }}
      />
      <Butterfly
        className="absolute right-[12%] top-[28%] animate-drift"
        color="var(--voya-purple)"
        size={32}
        style={{ animationDelay: "1.5s" }}
      />
      <Butterfly
        className="absolute left-[18%] bottom-[24%] animate-float"
        color="var(--voya-orange-light)"
        size={28}
        style={{ animationDelay: "0.8s", ["--rot" as string]: "-12deg" } as React.CSSProperties}
      />
      <Butterfly
        className="absolute right-[6%] bottom-[32%] animate-float"
        color="var(--voya-orange)"
        size={36}
        style={{ animationDelay: "2.2s", ["--rot" as string]: "8deg" } as React.CSSProperties}
      />

      <div className="relative mx-auto max-w-7xl px-6 pt-16 pb-8 md:pt-24 md:pb-16">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-voya-orange/30 bg-white/70 px-3 py-1 text-xs font-medium text-voya-orange">
              <span className="h-1.5 w-1.5 rounded-full bg-voya-orange animate-pulse" />
              Phase 1 — live today
            </span>
            <h1 className="mt-6 font-display text-5xl md:text-6xl lg:text-7xl font-medium leading-[1.05] text-foreground">
              Be the answer,
              <br />
              <span className="text-voya-orange">not an afterthought.</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-foreground/75 max-w-xl leading-relaxed">
              When people ask AI about retirement, Voya should be in the answer.
              GEO Command measures where we show up, creates the content that
              moves the needle, and proves it worked — every week.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#preview"
                className="inline-flex items-center justify-center rounded-full bg-gradient-voya text-white px-6 py-3 text-sm font-semibold shadow-soft hover:translate-y-[-1px] transition-transform"
              >
                Enter GEO Command →
              </a>
              <a
                href="#loop"
                className="inline-flex items-center justify-center rounded-full border border-foreground/15 bg-white/60 px-6 py-3 text-sm font-medium text-foreground hover:bg-white transition-colors"
              >
                See how it works
              </a>
            </div>
          </div>

          <div className="relative animate-fade-up" style={{ animationDelay: "0.15s" }}>
            <div className="relative aspect-[4/3] flex items-center justify-center">
              <div
                className="absolute inset-6 rounded-full blur-3xl opacity-50"
                style={{ background: "var(--gradient-voya)" }}
                aria-hidden
              />
              <img
                src={heroArt}
                alt="Val and Vern, Voya's origami fox and owl, surrounded by paper butterflies"
                width={1536}
                height={1024}
                className="relative w-full h-auto drop-shadow-[0_20px_40px_rgba(255,75,0,0.15)] animate-float"
              />
            </div>
            {/* swap-marker for designers */}
            <div className="absolute -bottom-3 right-2 text-[10px] uppercase tracking-widest text-foreground/40">
              Val &amp; Vern · placeholder
            </div>
          </div>
        </div>
      </div>

      {/* Voya Journey curve at bottom */}
      <VoyaJourney className="block w-full h-[120px] md:h-[160px]" />
    </section>
  );
}
