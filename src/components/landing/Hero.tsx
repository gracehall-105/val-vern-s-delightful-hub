import valSquirrel from "@/assets/val-squirrel.png";
import vernRabbit from "@/assets/vern-rabbit.png";
import beaconLighthouse from "@/assets/beacon-lighthouse-icon.png.asset.json";
import { Butterfly } from "./Butterfly";
import { useCompanies, usePrompts } from "@/lib/queries";

function useVoyaSom(branding: "branded" | "unbranded") {
  const companiesQ = useCompanies(branding);
  const promptsQ = usePrompts();
  const companies = (companiesQ.data as any)?.companies as
    | Array<{ company: string; share_pct: number }>
    | undefined;
  const voya = companies?.find(
    (c) => c.company?.toLowerCase() === "voya",
  );
  const prompts = promptsQ.data as
    | Array<{ branding?: string }>
    | undefined;
  const promptCount = prompts?.filter((p) => p.branding === branding).length;
  return {
    sharePct: voya?.share_pct,
    promptCount,
    loading: companiesQ.isLoading || promptsQ.isLoading,
  };
}

function formatPct(n?: number) {
  if (n === undefined || n === null || Number.isNaN(n)) return "—";
  return `${Math.round(n)}%`;
}

export function Hero() {
  const unbranded = useVoyaSom("unbranded");
  const branded = useVoyaSom("branded");

  const evidence = [
    {
      stat: formatPct(unbranded.sharePct),
      body:
        unbranded.promptCount !== undefined
          ? `Voya's Share of Model across ${unbranded.promptCount} unbranded prompts — the questions people ask before they know our name.`
          : "Voya's Share of Model across the unbranded prompt universe — the questions people ask before they know our name.",
    },
    {
      stat: formatPct(branded.sharePct),
      body:
        branded.promptCount !== undefined
          ? `Voya's Share of Model across ${branded.promptCount} branded prompts — where someone already searched for us by name.`
          : "Voya's Share of Model across the branded prompt universe — where someone already searched for us by name.",
    },
  ];

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
          <div className="animate-fade-up">
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-medium leading-[1.05] text-foreground">
              <span className="block">Turn insight</span>
              <span className="block">into <span className="text-voya-orange">action</span></span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-foreground/75 max-w-xl leading-relaxed">
              <span className="block">Voya Beacon measures AI and</span>
              <span className="block">search visibility, identifies content</span>
              <span className="block">gaps, recommends improvements,</span>
              <span className="block">and tracks impact.</span>
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
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

              {/* Animated lighthouse beacon behind Val & Vern */}
              <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden>
                {/* Rotating light beam emanating from the lamp */}
                <div
                  className="absolute animate-beacon-sweep"
                  style={{
                    left: "50%",
                    top: "34%",
                    width: "140%",
                    height: "140%",
                    transform: "translate(-50%, -50%)",
                    background:
                      "conic-gradient(from 0deg, transparent 0deg, rgba(255,120,20,0.35) 10deg, rgba(255,180,90,0.10) 26deg, transparent 44deg, transparent 180deg, rgba(255,120,20,0.35) 190deg, rgba(255,180,90,0.10) 206deg, transparent 224deg, transparent 360deg)",
                    filter: "blur(6px)",
                    mixBlendMode: "screen",
                    borderRadius: "9999px",
                  }}
                />
                {/* Warm halo around the lamp */}
                <div
                  className="absolute rounded-full animate-beacon-pulse"
                  style={{
                    left: "50%",
                    top: "34%",
                    width: "38%",
                    height: "38%",
                    transform: "translate(-50%, -50%)",
                    background:
                      "radial-gradient(circle, rgba(255,120,20,0.55) 0%, rgba(255,120,20,0.20) 45%, transparent 72%)",
                    filter: "blur(4px)",
                    mixBlendMode: "screen",
                  }}
                />
                {/* Lighthouse silhouette */}
                <img
                  src={beaconLighthouse.url}
                  alt=""
                  className="absolute left-1/2 -translate-x-1/2 opacity-90"
                  style={{ bottom: "6%", height: "78%", width: "auto" }}
                />
              </div>


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
      </div>
    </section>
  );
}
