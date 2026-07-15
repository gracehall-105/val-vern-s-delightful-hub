import { createFileRoute } from "@tanstack/react-router";
import { ProveView } from "@/components/app/ProveView";

export const Route = createFileRoute("/app/prove")({
  component: ProveView,
});
