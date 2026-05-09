export function TrustStrip() {
  const items = [
    "Phase 1 live",
    "Powered by Azure OpenAI",
    "Built on Voya infrastructure",
    "Human review before publish",
  ];
  return (
    <div className="border-y border-border/60 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-4 flex flex-wrap items-center justify-center gap-x-10 gap-y-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
        {items.map((t, i) => (
          <span key={t} className="flex items-center gap-3">
            {i > 0 && <span className="hidden sm:inline-block h-1 w-1 rounded-full bg-voya-orange" />}
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
