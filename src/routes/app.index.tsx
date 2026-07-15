import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CommandCenter } from "@/components/app/CommandCenter";

export const Route = createFileRoute("/app/")({
  component: CommandCenterRoute,
});

function CommandCenterRoute() {
  const navigate = useNavigate();
  const onNavigate = (view: string) => {
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
    const to = map[view] ?? `/app/${view}`;
    navigate({ to });
  };
  return <CommandCenter onNavigate={onNavigate} />;
}
