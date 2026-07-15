import { createFileRoute, useNavigate } from "@tanstack/react-router";
import MarketTrends from "@/components/app/MarketTrends";

export const Route = createFileRoute("/app/trends")({
  head: () => ({
    meta: [{ title: "Market trends — Beacon" }],
  }),
  component: TrendsRoute,
});

function TrendsRoute() {
  const navigate = useNavigate();
  return (
    <MarketTrends
      onNavigateToContent={(topic?: string, articleType?: string, rationale?: string, contentId?: number, targetGap?: string) => {
        navigate({
          to: "/app/create",
          search: { topic, articleType, rationale, contentId, targetGap } as any,
        });
      }}
    />
  );
}
