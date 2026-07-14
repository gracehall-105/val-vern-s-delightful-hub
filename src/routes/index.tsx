import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { TrustStrip } from "@/components/landing/TrustStrip";
import { LoopSection } from "@/components/landing/LoopSection";
import { DashboardPreview } from "@/components/landing/DashboardPreview";
import { Personas } from "@/components/landing/Personas";
import { DoesDoesnt } from "@/components/landing/DoesDoesnt";
import { Roadmap } from "@/components/landing/Roadmap";

import { JourneyDivider } from "@/components/landing/JourneyDivider";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Beacon — Voya Marketing" },
      {
        name: "description",
        content:
          "Beacon is Voya's closed-loop system that measures, creates, and proves the content that gets Voya into AI answers.",
      },
      { property: "og:title", content: "Beacon — Voya Marketing" },
      {
        property: "og:description",
        content: "Be the answer, not an afterthought. Voya's AI visibility command center.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const slides = [
    <Hero key="hero" />,
    <div key="loop" className="w-full"><TrustStrip /><LoopSection /></div>,
    <DashboardPreview key="dash" />,
    <Personas key="personas" />,
    <DoesDoesnt key="dd" />,
    <div key="road" className="w-full"><JourneyDivider /><Roadmap /></div>,
  ];

  const updateButtons = () => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 8);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  };

  useEffect(() => {
    updateButtons();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateButtons, { passive: true });
    window.addEventListener("resize", updateButtons);
    return () => {
      el.removeEventListener("scroll", updateButtons);
      window.removeEventListener("resize", updateButtons);
    };
  }, []);

  const scrollByPage = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth, behavior: "smooth" });
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Nav />
      <main className="relative flex-1 min-h-0">
        <div
          ref={scrollerRef}
          className="h-full w-full overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth flex"
        >
          {slides.map((slide, i) => (
            <section
              key={i}
              className="snap-start snap-always shrink-0 w-screen h-full overflow-y-auto pb-14 flex flex-col"
            >
              <div className="my-auto w-full">
                {slide}
              </div>
            </section>
          ))}
        </div>

        <button
          type="button"
          aria-label="Previous slide"
          onClick={() => scrollByPage(-1)}
          disabled={!canPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 h-12 w-12 rounded-full bg-background/90 backdrop-blur border border-border shadow-soft flex items-center justify-center text-foreground hover:bg-background transition disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label="Next slide"
          onClick={() => scrollByPage(1)}
          disabled={!canNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 h-12 w-12 rounded-full bg-background/90 backdrop-blur border border-border shadow-soft flex items-center justify-center text-foreground hover:bg-background transition disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ArrowRight className="h-5 w-5" />
        </button>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 border-t border-border/60 bg-background/85 backdrop-blur">
          <div className="mx-auto max-w-7xl px-6 h-12 flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="font-medium tracking-wide">Voya · Plan. Invest. Protect.</span>
            <span className="hidden sm:inline">Beacon · Internal Voya Marketing tool · Not for public distribution</span>
          </div>
        </div>
      </main>
    </div>
  );
}
