import { Link } from "@tanstack/react-router";
import beaconLogoLockup from "@/assets/beacon-logo-lockup.png.asset.json";

export function Nav() {
  return (
    <header className="sticky top-0 z-40 bg-[var(--voya-white)] border-b border-border/60">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center h-full py-2">
          <img
            src={beaconLogoLockup.url}
            alt="Beacon"
            className="object-contain h-full max-h-[44px] w-auto"
          />
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
