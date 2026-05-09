import valSquirrel from "@/assets/val-squirrel.png";
import vernRabbit from "@/assets/vern-rabbit.png";
import { Butterfly } from "./Butterfly";

/**
 * Hero — "Val and Vern's garden"
 *
 * Brand compliance notes:
 * - Val (squirrel) and Vern (rabbit) sit on a clean warm-white stage.
 *   Per brand: do NOT place the origami animals on an orange background
 *   or inside the Voya Journey/Supergraphic.
 * - Voya wordmark lives in the top nav, well away from the artwork.
 *   Per brand: never lock up the logo with the origami.
 * - The artwork itself is a brand-faithful PLACEHOLDER. Swap with the
 *   licensed Val & Vern files before any external use.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background">
      {/* Soft cream radial wash — never orange behind the characters */}
      <div
        className="absolute inset-0 -z-10"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 35%, oklch(0.985 0.012 75) 0%, oklch(0.97 0.012 70) 60%, var(--background) 100%)",
        }}
      />

      {/* Floating butterflies — kept clear of artwork center */}
      <Butterfly
        className="absolute left-[6%] top-[14%] animate-drift"
        color="var(--voya-orange)"
        size={40}
        style={{ animationDelay: "0s" }}
      />
      <Butterfly
        className="absolute right-[8%] top-[22%] animate-drift"
        color="var(--voya-purple)"
        size={30}
        style={{ animationDelay: "1.5s" }}
      />
      <Butterfly
        className="absolute left-[14%] bottom-[18%] animate-float"
        color="var(--voya-orange-light)"
        size={26}
        style={{ animationDelay: "0.8s", ["--rot" as string]: "-12deg" } as React.CSSProperties}
      />
      <Butterfly
        className="absolute right-[10%] bottom-[24%] animate-float"
        color="var(--voya-orange)"
        size={34}
        style={{ animationDelay: "2.2s", ["--rot" as string]: "8deg" } as React.CSSProperties}
      />

      <div className="relative mx-auto max-w-7xl px-6 pt-16 pb-24 md:pt-24 md:pb-32">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-voya-orange/30 bg-white px-3 py-1 text-xs font-medium text-voya-orange shadow-sm">
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
                className="inline-flex items-center justify-center rounded-full border border-foreground/15 bg-white px-6 py-3 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
              >
                See how it works
              </a>
            </div>
          </div>

          <div className="relative animate-fade-up" style={{ animationDelay: "0.15s" }}>
            <div className="relative aspect-[4/3] flex items-end justify-center">
              <div
                className="absolute inset-10 rounded-full blur-3xl opacity-40"
                style={{
                  background:
                    "radial-gradient(circle, oklch(0.92 0.09 55) 0%, transparent 70%)",
                }}
                aria-hidden
              />
              {/* Ground shadows */}
              <div className="absolute bottom-[8%] left-[14%] w-[26%] h-3 rounded-full blur-md opacity-25 bg-foreground" aria-hidden />
              <div className="absolute bottom-[8%] right-[16%] w-[24%] h-3 rounded-full blur-md opacity-25 bg-foreground" aria-hidden />

              <div className="relative w-full h-full flex items-end justify-center gap-2 md:gap-4 pb-[6%]">
                <img
                  src={valSquirrel}
                  alt="Val, an origami squirrel folded from orange dollar bills"
                  width={1024}
                  height={1024}
                  className="w-[46%] h-auto animate-val drop-shadow-xl"
                />
                <img
                  src={vernRabbit}
                  alt="Vern, an origami rabbit folded from orange dollar bills"
                  width={1024}
                  height={1024}
                  className="w-[44%] h-auto animate-vern drop-shadow-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

