import { createFileRoute } from "@tanstack/react-router";
import { ListenView } from "@/components/app/ListenView";

export const Route = createFileRoute("/app/listen")({
  component: ListenView,
});
