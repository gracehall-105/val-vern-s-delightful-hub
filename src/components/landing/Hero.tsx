import valSquirrel from "@/assets/val-squirrel.png";
import vernRabbit from "@/assets/vern-rabbit.png";
import beaconLogoLockup from "@/assets/beacon-logo-lockup.png.asset.json";
import { Butterfly } from "./Butterfly";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background">
      <div
        className="absolute inset-0 -z-10"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 35%, oklch(0.985 0.012 75) 0%, oklch(0.97 0.012 70) 60%, var(--background) 100%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 pt-10 pb-16 md:pt-14 md:pb-20">
        {/* Stage: giant Beacon lockup centered, Val & Vern nestled to the right */}
        <div className="relative animate-fade-up">
          <div className="relative mx-auto flex items-center justify-center min-h-[420px] md:min-h-[520px]">
            {/* Beacon logo lockup — the hero centerpiece */}
            <img
              src={beaconLogoLockup.url}
              alt="Voya Beacon — Insights. Intelligence. Impact."
              className="relative z-10 w-[78%] md:w-[62%] lg:w-[56%] h-auto object-contain drop-shadow-sm"
            />

            {/* Val & Vern floating to the right of the lockup */}
            <div className="absolute right-0 md:right-2 lg:right-6 top-1/2 -translate-y-1/2 w-[32%] md:w-[26%] lg:w-[24%] pointer-events-none">
              <div className="relative aspect-[5/4]">
                <Butterfly className="absolute left-[2%] top-[2%] animate-drift z-20" color="var(--voya-orange)" size={20} style={{ animationDelay: "0s" }} />
                <Butterfly className="absolute right-[6%] top-[0%] animate-drift z-20" color="var(--voya-purple)" size={18} style={{ animationDelay: "1.5s" }} />
                <Butterfly className="absolute left-[46%] top-[8%] animate-float z-20" color="var(--voya-orange-light)" size={16} style={{ animationDelay: "0.8s", ["--rot" as string]: "-12deg" } as React.CSSProperties} />

                <div className="absolute bottom-[4%] left-[8%] w-[36%] h-2 rounded-full blur-md opacity-25 bg-foreground" aria-hidden />
                <div className="absolute bottom-[4%] right-[8%] w-[34%] h-2 rounded-full blur-md opacity-25 bg-foreground" aria-hidden />

                <div className="relative w-full h-full flex items-end justify-center gap-1 md:gap-2 pb-[4%]">
                  <img
                    src={valSquirrel}
                    alt="Val, an origami squirrel folded from orange dollar bills"
                    width={1024}
                    height={1024}
                    className="w-[48%] h-auto animate-val drop-shadow-xl"
                  />
                  <img
                    src={vernRabbit}
                    alt="Vern, an origami rabbit folded from orange dollar bills"
                    width={1024}
                    height={1024}
                    className="w-[46%] h-auto animate-vern drop-shadow-xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom row: subheader on the left, CTAs on the right */}
        <div className="mt-10 md:mt-14 grid md:grid-cols-2 gap-8 md:gap-10 items-center">
          <p className="text-lg md:text-xl text-foreground/80 max-w-xl leading-relaxed">
            Voya Beacon measures AI and search visibility, identifies content
            gaps, recommends improvements, and tracks impact.
          </p>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <a
              href="/app"
              className="inline-flex items-center justify-center rounded-full bg-gradient-voya text-white px-6 py-3 text-sm font-semibold shadow-soft hover:translate-y-[-1px] transition-transform"
            >
              Enter Voya Beacon →
            </a>
            <a
              href="#loop"
              className="inline-flex items-center justify-center rounded-full border border-foreground/15 bg-white px-6 py-3 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
            >
              See how it works
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
