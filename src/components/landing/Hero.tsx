import valSquirrel from "@/assets/val-squirrel.png";
import vernRabbit from "@/assets/vern-rabbit.png";
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

      <div className="relative mx-auto max-w-7xl px-6 pt-12 pb-16 md:pt-16 md:pb-20">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div className="animate-fade-up" />

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

              <Butterfly className="absolute left-[4%] top-[2%] animate-drift z-10" color="var(--voya-orange)" size={32} style={{ animationDelay: "0s" }} />
              <Butterfly className="absolute right-[4%] top-[4%] animate-drift z-10" color="var(--voya-purple)" size={26} style={{ animationDelay: "1.5s" }} />
              <Butterfly className="absolute left-[42%] top-[0%] animate-float z-10" color="var(--voya-orange-light)" size={22} style={{ animationDelay: "0.8s", ["--rot" as string]: "-12deg" } as React.CSSProperties} />
              <Butterfly className="absolute right-[36%] top-[10%] animate-float z-10" color="var(--voya-orange)" size={24} style={{ animationDelay: "2.2s", ["--rot" as string]: "8deg" } as React.CSSProperties} />

              <div className="absolute bottom-[8%] left-[14%] w-[26%] h-3 rounded-full blur-md opacity-25 bg-foreground" aria-hidden />
              <div className="absolute bottom-[8%] right-[16%] w-[24%] h-3 rounded-full blur-md opacity-25 bg-foreground" aria-hidden />

              <div className="relative w-full h-full flex items-end justify-center gap-2 md:gap-4 pb-[6%]">
                <img src={valSquirrel} alt="Val, an origami squirrel folded from orange dollar bills" width={1024} height={1024} className="w-[46%] h-auto animate-val drop-shadow-xl" />
                <img src={vernRabbit} alt="Vern, an origami rabbit folded from orange dollar bills" width={1024} height={1024} className="w-[44%] h-auto animate-vern drop-shadow-xl" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col md:flex-row md:items-end justify-end gap-6">
          <p className="text-lg md:text-xl text-foreground/75 max-w-xl leading-relaxed text-right">
            <span className="block">Voya Beacon measures AI and search visibility,</span>
            <span className="block">identifies content gaps, recommends improvements,</span>
            <span className="block">and tracks impact.</span>
          </p>

          <div className="flex flex-wrap gap-3">
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
