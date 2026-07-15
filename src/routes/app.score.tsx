import { createFileRoute } from "@tanstack/react-router";
import { ScoreView } from "@/components/app/ScoreView";

export const Route = createFileRoute("/app/score")({
  component: ScoreView,
});
