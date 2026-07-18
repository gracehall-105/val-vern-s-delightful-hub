import { Link } from "@tanstack/react-router";
import beaconLogoLockup from "@/assets/beacon-logo-lockup.png.asset.json";

export function Nav() {
  return (
    <header className="sticky top-0 z-40 bg-[var(--voya-white)] border-b border-border/60">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center h-full py-2">
          <span className="relative inline-block h-full max-h-[44px]">
            <img
              src={beaconLogoLockup.url}
              alt="Beacon"
              className="object-contain h-full max-h-[44px] w-auto"
            />
            {/* Rotating lighthouse light — positioned over the lamp of the logo mark */}
            <span
              aria-hidden
              className="pointer-events-none absolute"
              style={{ left: "5.5%", top: "18%", width: "13%", aspectRatio: "1 / 1" }}
            >
              {/* Warm glow at the lamp */}
              <span
                className="absolute inset-0 rounded-full animate-beacon-pulse"
                style={{
                  background:
                    "radial-gradient(circle, rgba(255,120,20,0.85) 0%, rgba(255,120,20,0.35) 40%, transparent 70%)",
                  filter: "blur(1px)",
                  mixBlendMode: "screen",
                }}
              />
              {/* Rotating beam */}
              <span
                className="absolute rounded-full animate-beacon-sweep"
                style={{
                  left: "-140%",
                  top: "-140%",
                  width: "380%",
                  height: "380%",
                  background:
                    "conic-gradient(from 0deg, transparent 0deg, rgba(255,120,20,0.55) 8deg, rgba(255,180,90,0.15) 22deg, transparent 38deg, transparent 180deg, rgba(255,120,20,0.55) 188deg, rgba(255,180,90,0.15) 202deg, transparent 218deg, transparent 360deg)",
                  filter: "blur(2px)",
                  mixBlendMode: "screen",
                }}
              />
            </span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-foreground/80">
          <a href="#loop" className="hover:text-voya-orange transition-colors">How it works</a>
          <a href="#preview" className="hover:text-voya-orange transition-colors">Dashboard</a>
          <a href="#personas" className="hover:text-voya-orange transition-colors">Who it's for</a>
          <a href="#roadmap" className="hover:text-voya-orange transition-colors">Roadmap</a>
        </nav>
        <Link
          to="/app"
          className="inline-flex items-center justify-center rounded-full bg-gradient-voya text-white px-5 py-2 text-sm font-medium shadow-soft hover:shadow-lg transition-shadow"
        >
          Enter Voya Beacon
        </Link>
      </div>
    </header>
  );
}
