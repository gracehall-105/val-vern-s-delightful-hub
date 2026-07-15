import { createFileRoute, useSearch } from "@tanstack/react-router";
import { Operations } from "@/components/app/Operations";

export const Route = createFileRoute("/app/create")({
  validateSearch: (s: Record<string, unknown>) => ({
    topic: (s.topic as string) || undefined,
    articleType: (s.articleType as string) || undefined,
    rationale: (s.rationale as string) || undefined,
    contentId: s.contentId ? Number(s.contentId) : undefined,
    targetGap: (s.targetGap as string) || undefined,
  }),
  component: CreateRoute,
});

function CreateRoute() {
  const search = useSearch({ from: "/app/create" });
  const pendingTopic = search.topic
    ? {
        topic: search.topic,
        articleType: search.articleType ?? "guide",
        rationale: search.rationale,
        contentId: search.contentId,
        targetGap: search.targetGap,
      }
    : undefined;
  return <Operations pendingTopic={pendingTopic} onTopicConsumed={() => {}} />;
}
