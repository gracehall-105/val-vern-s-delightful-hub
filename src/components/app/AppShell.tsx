import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { BarChart3, Sparkles, FileEdit, TrendingUp, Search, Bell, Settings } from "lucide-react";
import { VoyaLogo } from "@/components/landing/VoyaLogo";

const nav = [
  { to: "/app", label: "Command Center", icon: BarChart3, exact: true },
  { to: "/app/measure", label: "Measure", icon: Sparkles, exact: false },
  { to: "/app/create", label: "Create", icon: FileEdit, exact: false },
  { to: "/app/prove", label: "Prove", icon: TrendingUp, exact: false },
] as const;

function useTitle() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const match = [...nav].reverse().find((n) => (n.exact ? path === n.to : path.startsWith(n.to)));
  return match?.label ?? "GEO Command";
}

export function AppShell() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const title = useTitle();

  return (
    <div className="min-h-screen flex w-full bg-secondary/30">
      {/* Sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-border bg-card">
        <Link to="/" className="flex items-center gap-2 px-5 h-16 border-b border-border">
          <VoyaLogo height={22} />
          <span className="h-4 w-px bg-border" />
          <span className="text-xs font-semibold tracking-wide text-foreground/80">GEO Command</span>
        </Link>

        <nav className="flex-1 px-3 py-5 space-y-0.5">
          <p className="px-3 pb-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Phase 1
          </p>
          {nav.map(({ to, label, icon: Icon, exact }) => {
            const active = exact ? path === to : path.startsWith(to);
            const isHome = to === "/app" && path === "/app";
            const on = active || isHome;
            return (
              <Link
                key={to}
                to={to}
                className={[
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  on
                    ? "bg-voya-orange/10 text-voya-orange font-medium"
                    : "text-foreground/75 hover:bg-secondary hover:text-foreground",
                ].join(" ")}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
                {on && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-voya-orange" />}
              </Link>
            );
          })}
        </nav>

        <div className="m-3 rounded-xl bg-gradient-supergraphic p-4 text-white">
          <p className="text-[11px] uppercase tracking-widest opacity-80">Phase 2 preview</p>
          <p className="mt-1 font-display text-lg leading-tight">VoC Listening Post</p>
          <p className="mt-1 text-xs opacity-85">Coming next quarter.</p>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-card/80 backdrop-blur border-b border-border flex items-center gap-4 px-5 md:px-8">
          <div className="md:hidden">
            <VoyaLogo height={20} />
          </div>
          <div>
            <h1 className="font-display text-xl md:text-2xl leading-none">{title}</h1>
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground mt-1">
              Internal use only
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 w-72 text-sm text-muted-foreground">
              <Search className="h-3.5 w-3.5" />
              <span>Search prompts, briefs, competitors…</span>
              <kbd className="ml-auto text-[10px] rounded bg-secondary px-1.5 py-0.5">⌘K</kbd>
            </div>
            <button className="h-9 w-9 grid place-items-center rounded-full hover:bg-secondary text-foreground/70">
              <Bell className="h-4 w-4" />
            </button>
            <button className="h-9 w-9 grid place-items-center rounded-full hover:bg-secondary text-foreground/70">
              <Settings className="h-4 w-4" />
            </button>
            <div className="ml-1 h-9 w-9 rounded-full bg-gradient-voya grid place-items-center text-white text-xs font-semibold">
              MK
            </div>
          </div>
        </header>

        {/* Mobile nav */}
        <nav className="md:hidden flex gap-1 overflow-x-auto px-4 py-2 border-b border-border bg-card">
          {nav.map(({ to, label, icon: Icon, exact }) => {
            const on = exact ? path === to : path.startsWith(to);
            const isHome = to === "/app" && path === "/app";
            const active = on || isHome;
            return (
              <Link
                key={to}
                to={to}
                className={[
                  "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs whitespace-nowrap",
                  active ? "bg-voya-orange text-white" : "bg-secondary text-foreground/70",
                ].join(" ")}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </Link>
            );
          })}
        </nav>

        <main className="flex-1 p-5 md:p-8 max-w-[1400px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

/* ---------- shared building blocks ---------- */

export function PageIntro({ eyebrow, title, lede }: { eyebrow: string; title: string; lede: string }) {
  return (
    <div className="max-w-3xl mb-8">
      <p className="text-[11px] uppercase tracking-[0.2em] text-voya-orange font-semibold">{eyebrow}</p>
      <h2 className="mt-2 font-display text-3xl md:text-4xl leading-tight">{title}</h2>
      <p className="mt-3 text-foreground/70 leading-relaxed">{lede}</p>
    </div>
  );
}

export function Panel({
  title,
  hint,
  className = "",
  children,
}: {
  title?: string;
  hint?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <section
      className={`rounded-2xl bg-card border border-border shadow-card p-5 md:p-6 ${className}`}
    >
      {(title || hint) && (
        <header className="flex items-baseline justify-between mb-4">
          {title && <h3 className="font-semibold text-sm">{title}</h3>}
          {hint && <span className="text-[11px] uppercase tracking-widest text-muted-foreground">{hint}</span>}
        </header>
      )}
      {children}
    </section>
  );
}

export function Placeholder({ label, height = 160 }: { label: string; height?: number }) {
  return (
    <div
      className="rounded-xl border border-dashed border-border/80 bg-secondary/40 grid place-items-center text-xs text-muted-foreground"
      style={{ minHeight: height }}
    >
      {label}
    </div>
  );
}
