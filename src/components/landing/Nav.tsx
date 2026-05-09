import { Link } from "@tanstack/react-router";
import { VoyaLogo } from "./VoyaLogo";

export function Nav() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-[color-mix(in_oklab,var(--background)_85%,transparent)] border-b border-border/60">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <VoyaLogo />
          <span className="hidden sm:inline-block h-5 w-px bg-border" />
          <span className="hidden sm:inline-block text-sm font-medium text-muted-foreground">
            GEO Command
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-foreground/80">
          <a href="#loop" className="hover:text-voya-orange transition-colors">How it works</a>
          <a href="#preview" className="hover:text-voya-orange transition-colors">Dashboard</a>
          <a href="#personas" className="hover:text-voya-orange transition-colors">Who it's for</a>
          <a href="#roadmap" className="hover:text-voya-orange transition-colors">Roadmap</a>
        </nav>
        <a
          href="#preview"
          className="inline-flex items-center justify-center rounded-full bg-gradient-voya text-white px-5 py-2 text-sm font-medium shadow-soft hover:shadow-lg transition-shadow"
        >
          Enter GEO Command
        </a>
      </div>
    </header>
  );
}
