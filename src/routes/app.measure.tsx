import { createFileRoute } from "@tanstack/react-router";
import { PromptLibrary } from "@/components/app/PromptLibrary";

export const Route = createFileRoute("/app/measure")({
  component: PromptLibrary,
});
