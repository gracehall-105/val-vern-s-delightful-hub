import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Search,
  Sparkles,
  FileEdit,
  TrendingUp,
  Download,
  Share2,
  PencilLine,
  ArrowRight,
  KeyRound,
  Database,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { PageIntro, Panel } from "@/components/app/AppShell";

export const Route = createFileRoute("/app/how-it-works")({
  head: () => ({
    meta: [{ title: "How Beacon works — Voya internal" }],
  }),
  component: HowItWorks,
});

const loop = [
  {
    icon: Ear,
    label: "Discover",
    body: "SEO rankings and Web Vitals signals surface what the market is searching for and how Voya.com performs. VoC listening will join this step once those integrations are wired up.",
  },
  {
    icon: Sparkles,
    label: "Measure",
    body: "Beacon runs your prompts across GPT-5 and Claude Haiku and records Voya's share vs. competitors. Filter by audience, branded/unbranded, category, and week.",
  },
  {
    icon: FileEdit,
    label: "Create",
    body: "Every measurable gap becomes a draft on the Activation Panel — with the target prompt, the gap it fills, and suggested copy. Review inline, edit, and mark ready.",
  },
  {
    icon: TrendingUp,
    label: "Prove",
    body: "After a piece is live, Beacon re-measures the same prompts and shows lift on Market Trends and the Command Center dashboard.",
  },
];

const liveToday = [
  "Sign-in gate (Voya email + shared alpha password)",
  "Command Center: SoM trends, category filters, chart toggles, backfill",
  "Listen: VoC clusters and Promote → Measure",
  "Measure / Prompt Library: search, expand categories, delete custom prompts",
  "Market Trends: audience, branded/unbranded, week, category filters",
  "Opportunity Forecast: fair-share gap calculator (branded vs. unbranded, channel vs. domain)",
  "Channel Strategy: channel breakdown with top-source drill-in",
  "Create / Activation Panel: review & edit drafts, pick a destination, download .docx",
  "Multi-Model view: GPT-5 and Claude Haiku side-by-side",
];

const comingSoon = [
  "Real SSO (replaces the shared alpha password)",
  "Run a Custom Prompt from the Prompt Library",
  "Direct publish to LinkedIn, X, Voya blog, and email",
  "Chatbot transcripts and App Store reviews as Listen sources",
  "Branded-source breakdowns in Opportunity Forecast",
];

function HowItWorks() {
  return (
    <>
      <PageIntro
        eyebrow="How it works"
        title="The whole loop, in plain English."
        lede="Beacon turns AI visibility into a weekly habit: listen to what customers ask, measure where Voya stands, create the answers, prove it moved. You're in the alpha — here's exactly what's working today and what's next."
      />

      {/* The loop */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loop.map(({ icon: Icon, label, body }, i) => (
          <Panel key={label}>
            <div className="flex items-center gap-2">
              <span className="h-7 w-7 grid place-items-center rounded-lg bg-voya-orange/10 text-voya-orange">
                <Icon className="h-4 w-4" />
              </span>
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                Step {i + 1}
              </p>
            </div>
            <p className="mt-3 font-display text-2xl">{label}</p>
            <p className="mt-2 text-sm text-foreground/70 leading-relaxed">{body}</p>
          </Panel>
        ))}
      </div>

      {/* Signing in */}
      <Panel className="mt-12" title="Signing in (alpha)" hint="Temporary">
        <div className="flex items-start gap-3">
          <span className="h-9 w-9 grid place-items-center rounded-xl bg-voya-orange/10 text-voya-orange shrink-0">
            <KeyRound className="h-5 w-5" />
          </span>
          <div className="text-sm text-foreground/75 leading-relaxed">
            <p>
              For alpha testing, Beacon is behind a shared password gate. Use your
              <code className="mx-1 px-1.5 py-0.5 rounded bg-secondary text-foreground text-xs">@voya.com</code>
              email and the alpha password shared with your cohort. Your name and initials in the top-right
              come from the email you sign in with — nothing is stored server-side yet.
            </p>
            <p className="mt-2 text-muted-foreground">
              This gate will be replaced by Voya SSO before general availability.
            </p>
          </div>
        </div>
      </Panel>

      {/* What you actually do */}
      <div className="mt-12">
        <p className="text-[11px] uppercase tracking-[0.2em] text-voya-orange font-semibold">
          What you actually do in Create
        </p>
        <h3 className="mt-2 font-display text-2xl md:text-3xl leading-tight">
          Three buttons. That's the whole job.
        </h3>
        <p className="mt-3 max-w-2xl text-foreground/70 leading-relaxed">
          You don't run a kanban. You don't manage a pipeline. Open Create, see the drafts waiting
          for you, and pick one of three actions on each card.
        </p>

        <div className="mt-6 grid lg:grid-cols-3 gap-5">
          <Panel>
            <span className="h-10 w-10 grid place-items-center rounded-xl bg-voya-orange/10 text-voya-orange">
              <PencilLine className="h-5 w-5" />
            </span>
            <p className="mt-4 font-semibold">Review &amp; edit</p>
            <p className="mt-2 text-sm text-foreground/70 leading-relaxed">
              Open the draft inline. See the gap it's filling, the target prompt, and the suggested
              copy. Tweak anything you want.
            </p>
            <p className="mt-3 text-[11px] uppercase tracking-widest text-voya-orange">Available now</p>
          </Panel>

          <Panel>
            <span className="h-10 w-10 grid place-items-center rounded-xl bg-voya-orange/10 text-voya-orange">
              <Download className="h-5 w-5" />
            </span>
            <p className="mt-4 font-semibold">Download .docx</p>
            <p className="mt-2 text-sm text-foreground/70 leading-relaxed">
              One click, clean Word file, brand-safe formatting. Hand it off to whoever owns the
              channel today.
            </p>
            <p className="mt-3 text-[11px] uppercase tracking-widest text-voya-orange">Available now</p>
          </Panel>

          <Panel>
            <span className="h-10 w-10 grid place-items-center rounded-xl bg-voya-purple/10 text-voya-purple">
              <Share2 className="h-5 w-5" />
            </span>
            <p className="mt-4 font-semibold">Publish to…</p>
            <p className="mt-2 text-sm text-foreground/70 leading-relaxed">
              LinkedIn, X, the Voya blog, email. The destination picker and queued state are live in
              the UI today; direct publishing wires up in a later phase.
            </p>
            <p className="mt-3 text-[11px] uppercase tracking-widest text-voya-purple">
              UI live · publishing coming
            </p>
          </Panel>
        </div>
      </div>

      {/* Live today vs coming soon */}
      <div className="mt-12 grid lg:grid-cols-2 gap-5">
        <Panel title="Live in this alpha" hint="You can use these now">
          <ul className="mt-2 space-y-2">
            {liveToday.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-foreground/80 leading-relaxed">
                <CheckCircle2 className="h-4 w-4 text-voya-orange mt-0.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Coming next" hint="On the roadmap">
          <ul className="mt-2 space-y-2">
            {comingSoon.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-foreground/80 leading-relaxed">
                <Clock className="h-4 w-4 text-voya-purple mt-0.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {/* Behind the scenes */}
      <Panel className="mt-12" title="Where the data comes from" hint="For the curious">
        <div className="flex items-start gap-3">
          <span className="h-9 w-9 grid place-items-center rounded-xl bg-voya-orange/10 text-voya-orange shrink-0">
            <Database className="h-5 w-5" />
          </span>
          <div className="grid md:grid-cols-2 gap-x-8 gap-y-3 text-sm text-foreground/75 leading-relaxed">
            <p>
              Beacon reads share, trend, prompt, and source data from the Voya Databricks warehouse.
              Charts and tables you see are live — panels show "Awaiting data" when a source hasn't
              been backfilled yet.
            </p>
            <p>
              VoC clusters in Listen come from the warehouse too; promoting a cluster registers it
              as a tracked prompt so Measure and Prove can score it going forward.
            </p>
            <p>
              Nothing is auto-published. Every piece needs a human click before it leaves Voya —
              even once direct publishing is wired up.
            </p>
            <p>
              All activity stays inside Voya's tenant. No drafts, briefs, or customer verbatims
              leave the Azure environment.
            </p>
          </div>
        </div>
      </Panel>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          to="/app/create"
          className="inline-flex items-center gap-2 rounded-full bg-gradient-voya text-white px-5 py-2.5 text-sm font-medium shadow-soft"
        >
          Open Create <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          to="/app"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium"
        >
          Back to Command Center
        </Link>
      </div>
    </>
  );
}
