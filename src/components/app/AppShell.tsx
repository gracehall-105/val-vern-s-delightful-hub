import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Ear,
  Sparkles,
  Layers,
  FileEdit,
  Gauge,
  TrendingUp,
  Search,
  Bell,
  Settings,
  HelpCircle,
} from "lucide-react";
import { VoyaLogo } from "@/components/landing/VoyaLogo";

type Item = {
  to: "/app" | "/app/listen" | "/app/measure" | "/app/models" | "/app/create" | "/app/score" | "/app/prove";
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  phase?: 1 | 2;
  exact?: boolean;
};

type Group = { label: string; items: Item[] };

const groups: Group[] = [
  {
    label: "Overview",
    items: [{ to: "/app", label: "Command Center", icon: LayoutDashboard, phase: 1, exact: true }],
  },
  {
    label: "Listen",
    items: [{ to: "/app/listen", label: "VoC Listening Post", icon: Ear, phase: 2 }],
  },
  {
    label: "Measure",
    items: [
      { to: "/app/measure", label: "Prompt library", icon: Sparkles, phase: 1 },
      { to: "/app/models", label: "Multi-model", icon: Layers, phase: 2 },
    ],
  },
  {
    label: "Create",
    items: [
      { to: "/app/create", label: "Content pipeline", icon: FileEdit, phase: 1 },
      { to: "/app/score", label: "Content scoring", icon: Gauge, phase: 2 },
    ],
  },
  {
    label: "Prove",
    items: [{ to: "/app/prove", label: "Reporting", icon: TrendingUp, phase: 1 }],
  },
];

const allItems = groups.flatMap((g) => g.items);

function isActive(item: Item, path: string) {
  return item.exact ? path === item.to : path === item.to || path.startsWith(item.to + "/");
}

function useTitle() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  // Prefer the most specific (longest) match.
  const match = [...allItems]
    .sort((a, b) => b.to.length - a.to.length)
    .find((i) => isActive(i, path));
  return match?.label ?? "GEO Command";
}

export function AppShell() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const title = useTitle();

  return (
    <div className="min-h-screen flex w-full bg-secondary/30">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border bg-card">
        <Link to="/" className="flex items-center gap-2 px-5 h-16 border-b border-border">
          <VoyaLogo height={22} />
          <span className="h-4 w-px bg-border" />
          <span className="text-xs font-semibold tracking-wide text-foreground/80">GEO Command</span>
        </Link>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {groups.map((g) => (
            <div key={g.label}>
              <p className="px-3 pb-1.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {g.label}
              </p>
              <div className="space-y-0.5">
                {g.items.map(({ to, label, icon: Icon, phase }) => {
                  const on = isActive({ to, label, icon: Icon, exact: to === "/app" }, path);
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
                      <span className="truncate">{label}</span>
                      {phase === 2 && (
                        <span className="ml-auto text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-voya-purple/10 text-voya-purple">
                          P2
                        </span>
                      )}
                      {on && phase !== 2 && (
                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-voya-orange" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="m-3 rounded-xl border border-border p-3 text-[11px] text-muted-foreground">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-voya-orange mr-1.5 align-middle" />
          Phase 1 live · Phase 2 in design
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
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
            <Link
              to="/app/how-it-works"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-voya-orange transition-colors px-2 py-1.5 rounded-md"
              activeProps={{ className: "text-voya-orange" }}
            >
              <HelpCircle className="h-3.5 w-3.5" />
              How it works
            </Link>
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
          {allItems.map(({ to, label, icon: Icon, phase }) => {
            const on = isActive({ to, label, icon: Icon, exact: to === "/app" }, path);
            return (
              <Link
                key={to}
                to={to}
                className={[
                  "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs whitespace-nowrap",
                  on ? "bg-voya-orange text-white" : "bg-secondary text-foreground/70",
                ].join(" ")}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
                {phase === 2 && <span className="text-[9px] opacity-70">·P2</span>}
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

export function PageIntro({
  eyebrow,
  title,
  lede,
  phase,
}: {
  eyebrow: string;
  title: string;
  lede: string;
  phase?: 1 | 2;
}) {
  return (
    <div className="max-w-3xl mb-8">
      <div className="flex items-center gap-2">
        <p className="text-[11px] uppercase tracking-[0.2em] text-voya-orange font-semibold">{eyebrow}</p>
        {phase === 2 && (
          <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-voya-purple/10 text-voya-purple">
            Phase 2 · Preview
          </span>
        )}
      </div>
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
      className="rounded-xl border border-dashed border-border/80 bg-secondary/40 grid place-items-center text-xs text-muted-foreground text-center px-4"
      style={{ minHeight: height }}
    >
      {label}
    </div>
  );
}
