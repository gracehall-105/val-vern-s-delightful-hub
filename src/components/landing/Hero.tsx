import valSquirrel from "@/assets/val-squirrel.png";
import vernRabbit from "@/assets/vern-rabbit.png";
import beaconLogoLockup from "@/assets/beacon-logo-lockup.png.asset.json";
import { Butterfly } from "./Butterfly";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background">
      <div className="relative mx-auto max-w-7xl px-6 pt-10 pb-14 md:pt-14 md:pb-16">
        {/* Stage */}
        <div className="relative animate-fade-up">
          {/* Soft textured panel holding the Beacon lockup */}
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{
              background:
                "radial-gradient(ellipse 70% 60% at 50% 40%, oklch(0.975 0 0) 0%, oklch(0.955 0.003 90) 70%, oklch(0.94 0.003 90) 100%)",
            }}
          >
            {/* subtle noise/grain to match the reference texture */}
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.35] mix-blend-multiply"
              aria-hidden
              style={{
                backgroundImage:
                  "radial-gradient(rgba(0,0,0,0.06) 1px, transparent 1px)",
                backgroundSize: "3px 3px",
              }}
            />

            <div className="relative flex items-center justify-center py-14 md:py-20 lg:py-24 px-6">
              <img
                src={beaconLogoLockup.url}
                alt="Voya Beacon — Insights. Intelligence. Impact."
                className="relative z-10 w-[70%] md:w-[58%] lg:w-[52%] h-auto object-contain"
              />
            </div>

            {/* Val & Vern — floating card nestled at the right edge */}
            <div className="absolute right-4 md:right-6 lg:right-10 top-1/2 -translate-y-1/2 w-[30%] md:w-[24%] lg:w-[22%] z-20">
              <div
                className="relative rounded-xl bg-white shadow-soft ring-1 ring-black/5 overflow-hidden"
                style={{ aspectRatio: "5 / 4" }}
              >
                <Butterfly className="absolute left-[6%] top-[6%] animate-drift z-20" color="var(--voya-orange)" size={16} style={{ animationDelay: "0s" }} />
                <Butterfly className="absolute right-[8%] top-[4%] animate-drift z-20" color="var(--voya-purple)" size={14} style={{ animationDelay: "1.5s" }} />
                <Butterfly className="absolute left-[46%] top-[10%] animate-float z-20" color="var(--voya-orange-light)" size={12} style={{ animationDelay: "0.8s", ["--rot" as string]: "-12deg" } as React.CSSProperties} />

                <div className="absolute inset-x-0 bottom-0 h-full flex items-end justify-center gap-1 pb-[6%] px-[6%]">
                  <img
                    src={valSquirrel}
                    alt="Val, an origami squirrel folded from orange dollar bills"
                    width={1024}
                    height={1024}
                    className="w-[46%] h-auto animate-val drop-shadow-md"
                  />
                  <img
                    src={vernRabbit}
                    alt="Vern, an origami rabbit folded from orange dollar bills"
                    width={1024}
                    height={1024}
                    className="w-[44%] h-auto animate-vern drop-shadow-md"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom row: subheader on the left, CTAs on the right */}
        <div className="mt-10 md:mt-12 grid md:grid-cols-2 gap-8 md:gap-10 items-center">
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
