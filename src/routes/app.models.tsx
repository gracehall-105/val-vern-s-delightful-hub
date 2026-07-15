import { createFileRoute } from "@tanstack/react-router";
import { ModelsView } from "@/components/app/ModelsView";

export const Route = createFileRoute("/app/models")({
  component: ModelsView,
});
