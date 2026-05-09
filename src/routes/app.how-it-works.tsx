import { createFileRoute, Link } from "@tanstack/react-router";
import { Ear, Sparkles, FileEdit, TrendingUp, Download, Share2, PencilLine, ArrowRight } from "lucide-react";
import { PageIntro, Panel } from "@/components/app/AppShell";

export const Route = createFileRoute("/app/how-it-works")({
  head: () => ({
    meta: [{ title: "How GEO Command works — Voya internal" }],
  }),
  component: HowItWorks,
});

const loop = [
  {
    icon: Ear,
    label: "Listen",
    body: "Real customer questions flow in from Genesys, Qualtrics, and chat. We cluster them so you see what's actually being asked — not what we guessed.",
  },
  {
    icon: Sparkles,
    label: "Measure",
    body: "We run those questions across ChatGPT, Claude, Gemini, and Perplexity to see where Voya shows up, where competitors do, and where we're invisible.",
  },
  {
    icon: FileEdit,
    label: "Create",
    body: "Every gap becomes a draft, written to be the answer the model picks. You review, tweak, and ship — no blank page, no committee.",
  },
  {
    icon: TrendingUp,
    label: "Prove",
    body: "After publish, we re-measure and show the share lift per piece. Your CMO gets a one-page summary; you get the receipts.",
  },
];

function HowItWorks() {
  return (
    <>
      <PageIntro
        eyebrow="How it works"
        title="The whole loop, in plain English."
        lede="GEO Command turns AI visibility into a weekly habit: listen to what customers ask, measure where Voya stands, create the answers, prove it moved."
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

      {/* The Create flow — what the user actually does */}
      <div className="mt-12">
        <p className="text-[11px] uppercase tracking-[0.2em] text-voya-orange font-semibold">
          What you actually do
        </p>
        <h3 className="mt-2 font-display text-2xl md:text-3xl leading-tight">
          Three buttons. That's the whole job.
        </h3>
        <p className="mt-3 max-w-2xl text-foreground/70 leading-relaxed">
          You don't run a kanban. You don't manage a pipeline. You open Create, see the drafts
          waiting for you, and pick one of three actions on each card.
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
              LinkedIn, X, the Voya blog, email. Push directly from GEO Command — no copy-paste,
              no separate scheduler.
            </p>
            <p className="mt-3 text-[11px] uppercase tracking-widest text-voya-purple">
              Coming in a future phase
            </p>
          </Panel>
        </div>
      </div>

      {/* Behind the scenes */}
      <Panel className="mt-12" title="What's happening behind the scenes" hint="For the curious">
        <div className="grid md:grid-cols-2 gap-x-8 gap-y-4 text-sm text-foreground/75 leading-relaxed">
          <p>
            Each draft still has a status — idea, briefed, drafted, in review, published — so Prove
            can tie published pieces back to share lift. You just don't have to manage the lanes.
          </p>
          <p>
            Reviews and edits are versioned. If a draft gets published and underperforms, we can
            roll back to the brief and try a different angle.
          </p>
          <p>
            Nothing is auto-published. Every piece needs a human click before it leaves Voya — even
            once direct publishing is wired up.
          </p>
          <p>
            All activity stays inside Voya's tenant. No drafts, briefs, or customer verbatims leave
            the Azure environment.
          </p>
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
