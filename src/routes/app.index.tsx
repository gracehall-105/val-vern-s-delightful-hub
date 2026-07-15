import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CommandCenter } from "@/components/app/CommandCenter";

export const Route = createFileRoute("/app/")({
  component: CommandCenterRoute,
});

function CommandCenterRoute() {
  const navigate = useNavigate();
  return (
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
  );
}
