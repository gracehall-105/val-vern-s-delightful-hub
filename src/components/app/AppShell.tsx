import { useEffect, useRef, useState } from "react";
import { Link, Outlet, useRouter, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Ear,
  Sparkles,
  Layers,
  FileEdit,
  Gauge,
  TrendingUp,
  BarChart3,
  Lightbulb,
  Radio,
  Bell,
  Settings,
  HelpCircle,
  LogOut,
  PanelLeft,
  PanelRight,
} from "lucide-react";
import { ThemeToggle } from "@/components/app/ThemeToggle";
import lighthouseIcon from "@/assets/beacon-lighthouse.png";
import beaconWordmark from "@/assets/beacon-wordmark-tagline.png";

type Item = {
  to:
    | "/app"
    | "/app/listen"
    | "/app/measure"
    | "/app/trends"
    | "/app/models"
    | "/app/opportunities"
    | "/app/create"
    | "/app/channels"
    | "/app/score"
    | "/app/prove";
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  phase?: 1 | 2;
  tooltip: string;
  exact?: boolean;
};

type Group = { label: string; items: Item[] };

const groups: Group[] = [
  {
    label: "Overview",
    items: [
      { to: "/app", label: "Dashboard", icon: LayoutDashboard, phase: 1, exact: true, tooltip: "Action-oriented view: what changed this week and what to do next." },
      { to: "/app/opportunities", label: "Opportunity Forecast", icon: Lightbulb, phase: 1, tooltip: "Market representation analysis — where AI underweights Voya and what closing the gap means." },
      { to: "/app/trends", label: "Market Trends", icon: BarChart3, phase: 1, tooltip: "Deep-dive analytics — SoM trends, competitive leaderboard, citation sources, prompt breakdown." },
      { to: "/app/channels", label: "Channel strategy", icon: Radio, phase: 1, tooltip: "See which publication channels AI models cite most — and where Voya is missing." },
    ],
  },
  {
    label: "Listen",
    items: [
      { to: "/app/listen", label: "VoC Listening Post", icon: Ear, phase: 2, tooltip: "Monitor what customers and prospects are asking AI about retirement and investing." },
    ],
  },
  {
    label: "Create",
    items: [
      { to: "/app/create", label: "Content pipeline", icon: FileEdit, phase: 1, tooltip: "Review and publish AI-generated content briefs designed to close citation gaps." },
      { to: "/app/score", label: "Content scoring", icon: Gauge, phase: 1, tooltip: "Score draft content against AI citation criteria before publishing." },
      { to: "/app/measure", label: "Prompt library", icon: Sparkles, phase: 1, tooltip: "Browse all tracked prompts by category, run custom prompts, view raw responses, and drill down by domain." },
    ],
  },
  {
    label: "Measure",
    items: [
      { to: "/app/models", label: "Multi-model", icon: Layers, phase: 1, tooltip: "Compare how GPT-5 and Claude Haiku cite Voya across the same prompts." },
      { to: "/app/prove", label: "Reporting", icon: TrendingUp, phase: 1, tooltip: "Track whether published content moved Voya's share on targeted prompts." },
    ],
  },
];

const allItems = groups.flatMap((g) => g.items);

function isActive(item: Item, path: string) {
  return item.exact ? path === item.to : path === item.to || path.startsWith(item.to + "/");
}

function useTitle() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const match = [...allItems]
    .sort((a, b) => b.to.length - a.to.length)
    .find((i) => isActive(i, path));
  return match?.label ?? "Voya Beacon";
}

export function AppShell() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const title = useTitle();
  const router = useRouter();
  const isLoginRoute = path === "/app/login";

  // Client-side session gate — parity with LoginPage from VS Code build.
  const [authed, setAuthed] = useState<boolean | null>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isLoginRoute) { setAuthed(true); return; }
    const user = sessionStorage.getItem("activation-studio-user");
    if (!user) {
      router.navigate({ to: "/app/login" as any });
      setAuthed(false);
      return;
    }
    setAuthed(true);
  }, [router, isLoginRoute]);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [tooltip, setTooltip] = useState<{ text: string; top: number } | null>(null);
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function showTooltip(e: React.MouseEvent, text: string) {
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setTooltip({ text, top: rect.top + rect.height / 2 });
  }
  function scheduleHide() {
    hideTimeout.current = setTimeout(() => setTooltip(null), 120);
  }
  useEffect(() => () => { if (hideTimeout.current) clearTimeout(hideTimeout.current); }, []);

  function signOut() {
    if (typeof window !== "undefined") sessionStorage.removeItem("activation-studio-user");
    router.navigate({ to: "/app/login" as any });
  }

  if (authed === false) return null;
  if (isLoginRoute) return <Outlet />;

  return (
    <div className="min-h-screen flex w-full bg-secondary/30">
      {/* Tooltip portal */}
      {tooltip && (
        <div
          className="fixed z-[100] pointer-events-none hidden md:block"
          style={{ left: sidebarCollapsed ? 72 : 260, top: tooltip.top, transform: "translateY(-50%)" }}
        >
          <div className="relative ml-2 max-w-xs">
            <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-foreground rotate-45 rounded-[2px]" />
            <div className="relative rounded-lg bg-foreground text-background px-3.5 py-2.5 text-[12px] leading-relaxed shadow-lg">
              {tooltip.text}
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside
        className={[
          "hidden md:flex shrink-0 flex-col border-r border-border bg-card transition-all duration-300",
          sidebarCollapsed ? "w-16" : "w-64",
        ].join(" ")}
      >
        <div className="flex items-center justify-center h-16 border-b border-border px-3">
          <Link to="/" className="flex items-center gap-2">
            <img src={lighthouseIcon} alt="" className="h-[96px] w-[96px] object-contain dark:invert mt-2" />
            {!sidebarCollapsed && (
              <img src={beaconWordmark} alt="Beacon" className="h-14 w-auto object-contain dark:invert" />
            )}
          </Link>
        </div>

        <nav className={`flex-1 overflow-y-auto py-4 space-y-5 ${sidebarCollapsed ? "px-2" : "px-3"}`}>
          {groups.map((g) => (
            <div key={g.label}>
              {!sidebarCollapsed && (
                <p className="px-3 pb-1.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {g.label}
                </p>
              )}
              <div className="space-y-0.5">
                {g.items.map((item) => {
                  const { to, label, icon: Icon, phase, tooltip: tip } = item;
                  const on = isActive(item, path);
                  const isPhase2 = phase === 2;
                  const baseClass = [
                    "w-full group flex items-center rounded-lg py-2 text-sm transition-colors",
                    sidebarCollapsed ? "justify-center px-2" : "gap-3 px-3",
                    isPhase2
                      ? "opacity-40 cursor-not-allowed text-foreground/50"
                      : on
                        ? "bg-voya-orange/10 text-voya-orange font-medium"
                        : "text-foreground/75 hover:bg-secondary hover:text-foreground",
                  ].join(" ");
                  const content = (
                    <>
                      <Icon className="h-4 w-4" />
                      {!sidebarCollapsed && (
                        <>
                          <span className="truncate">{label}</span>
                          {isPhase2 ? (
                            <span className="ml-auto shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                              Phase 2
                            </span>
                          ) : on ? (
                            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-voya-orange" />
                          ) : null}
                        </>
                      )}
                    </>
                  );
                  const hoverText = isPhase2 ? "Coming in Phase 2 — requires additional integration" : tip;
                  return isPhase2 ? (
                    <button
                      key={to}
                      disabled
                      onMouseEnter={(e) => showTooltip(e, hoverText)}
                      onMouseLeave={scheduleHide}
                      className={baseClass}
                    >
                      {content}
                    </button>
                  ) : (
                    <Link
                      key={to}
                      to={to}
                      onMouseEnter={(e) => showTooltip(e, hoverText)}
                      onMouseLeave={scheduleHide}
                      className={baseClass}
                    >
                      {content}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {!sidebarCollapsed && (
          <div className="m-3 rounded-xl border border-border p-3 text-[11px] text-muted-foreground">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-voya-orange mr-1.5 align-middle" />
            Production workspace
          </div>
        )}
        <div className="border-t border-border p-3">
          <button
            onClick={() => setSidebarCollapsed((v) => !v)}
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={[
              "w-full rounded-lg hover:bg-secondary text-foreground/60 hover:text-foreground transition-colors flex items-center",
              sidebarCollapsed ? "justify-center h-8" : "justify-start gap-2 px-3 h-8",
            ].join(" ")}
          >
            {sidebarCollapsed ? <PanelRight className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
            {!sidebarCollapsed && <span className="text-sm">Collapse sidebar</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 h-16 bg-card/80 backdrop-blur border-b border-border flex items-center gap-4 px-5 md:px-8">
          <div className="md:hidden flex items-center gap-2">
            <img src={lighthouseIcon} alt="" className="h-[96px] w-[96px] object-contain dark:invert mt-2" />
            <img src={beaconWordmark} alt="Beacon" className="h-14 w-auto object-contain dark:invert" />
          </div>
          <div>
            <h1 className="font-display text-xl md:text-2xl leading-none">{title}</h1>
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground mt-1">
              Internal use only
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link
              to={"/app/how-it-works" as any}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-voya-orange transition-colors px-2 py-1.5 rounded-md"
              activeProps={{ className: "text-voya-orange" }}
            >
              <HelpCircle className="h-3.5 w-3.5" />
              How it works
            </Link>
            <ThemeToggle />
            <button className="h-9 w-9 grid place-items-center rounded-full hover:bg-secondary text-foreground/70">
              <Bell className="h-4 w-4" />
            </button>
            <button className="h-9 w-9 grid place-items-center rounded-full hover:bg-secondary text-foreground/70">
              <Settings className="h-4 w-4" />
            </button>
            <button
              onClick={signOut}
              title="Sign out"
              className="h-9 w-9 grid place-items-center rounded-full hover:bg-secondary text-foreground/70"
            >
              <LogOut className="h-4 w-4" />
            </button>
            <div className="ml-1 h-9 w-9 rounded-full bg-gradient-voya grid place-items-center text-white text-xs font-semibold">
              MK
            </div>
          </div>
        </header>

        {/* Mobile nav */}
        <nav className="md:hidden flex gap-1 overflow-x-auto px-4 py-2 border-b border-border bg-card">
          {allItems.filter(i => i.phase !== 2).map((item) => {
            const { to, label, icon: Icon } = item;
            const on = isActive(item, path);
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
