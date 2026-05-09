import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { TrustStrip } from "@/components/landing/TrustStrip";
import { LoopSection } from "@/components/landing/LoopSection";
import { DashboardPreview } from "@/components/landing/DashboardPreview";
import { Personas } from "@/components/landing/Personas";
import { DoesDoesnt } from "@/components/landing/DoesDoesnt";
import { Roadmap } from "@/components/landing/Roadmap";
import { Footer } from "@/components/landing/Footer";
import { JourneyDivider } from "@/components/landing/JourneyDivider";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GEO Command — Voya Marketing" },
      {
        name: "description",
        content:
          "GEO Command is Voya's closed-loop system that measures, creates, and proves the content that gets Voya into AI answers.",
      },
      { property: "og:title", content: "GEO Command — Voya Marketing" },
      {
        property: "og:description",
        content: "Be the answer, not an afterthought. Voya's AI visibility command center.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen">
      <Nav />
      <main>
        <Hero />
        <TrustStrip />
        <LoopSection />
        <DashboardPreview />
        <Personas />
        <DoesDoesnt />
        <JourneyDivider />
        <Roadmap />
      </main>
      <Footer />
    </div>
  );
}
