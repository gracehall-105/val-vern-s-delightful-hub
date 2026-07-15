import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CommandCenter } from "@/components/app/CommandCenter";
import { useCurrentUser } from "@/lib/currentUser";

export const Route = createFileRoute("/app/")({
  component: CommandCenterRoute,
});

function CommandCenterRoute() {
  const navigate = useNavigate();
  const user = useCurrentUser();
  return (
    <div>
      <div className="px-4 md:px-6 pt-4">
        <h2 className="font-display text-2xl md:text-3xl leading-tight">
          Hello, <span className="text-voya-orange">{user?.firstName ?? "there"}</span>
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Here's what's changed across your competitive landscape.
        </p>
      </div>
      <CommandCenter
        onNavigate={(topic, articleType, rationale, contentId, targetGap) => {
          navigate({
            to: "/app/create",
            search: { topic, articleType, rationale, contentId, targetGap } as any,
          });
        }}
        onViewChange={(view) => {
          const map: Record<string, string> = {
            "market-trends": "/app/trends",
            "prompt-library": "/app/measure",
            operations: "/app/create",
            opportunities: "/app/opportunities",
            models: "/app/models",
            channels: "/app/channels",
            listen: "/app/listen",
            prove: "/app/prove",
          };
          navigate({ to: (map[view] ?? `/app/${view}`) as any });
        }}
      />
    </div>
  );
}
