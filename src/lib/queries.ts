/**
 * Shared types shipped from the Databricks backend. Keep this file in sync
 * with your backend response contracts. Frontend only — no runtime code.
 */

export interface Citation {
  source: string;
  url?: string | null;
  quoted_text?: string | null;
}

export interface CompetitiveSignal {
  competitor: string;
  content_topic: string;
  share_delta_pct: number;
  example_citations: Citation[];
  executive_summary?: string | null;
}

/* ---------- Sources / channel strategy ---------- */

export interface SourceSummary {
  source_name: string;
  source_type: string;
  citations: number;
  for_voya_pct: number;
  prompts: number;
}

export interface SourceData {
  sources: SourceSummary[];
  total_citations: number;
  total_sources: number;
  voya_sources: number;
  type_breakdown: Record<string, number>;
}

/* ---------- Activation / content generation ---------- */

export interface Destination {
  id: string;
  name: string;
  why: string;
  url: string;
  type: "recommended" | "alternative";
}

export interface GeneratedContent {
  title: string;
  slug: string;
  meta_description: string;
  body_html: string;
  word_count: number;
  faq_count: number;
  compliance_notes: string;
  target_keywords: string[];
  schema_types: string[];
  destinations: Destination[];
}

/* ============================================================
 * TanStack Query hooks
 * These wrap the Databricks App backend endpoints. All hooks
 * fail gracefully — return empty/undefined when the backend
 * hasn't been connected yet. No mock or synthetic fallback.
 * ============================================================ */

import { useQuery } from "@tanstack/react-query";
import { API_BASE } from "./api";

async function getJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

/* ---------- Competitive signals ---------- */

export interface CompetitiveContent {
  signals: CompetitiveSignal[];
  updated_at?: string;
}

export function useCompetitiveContent() {
  return useQuery<CompetitiveContent>({
    queryKey: ["competitive", "signals", 7],
    queryFn: () => getJSON<CompetitiveContent>(`/competitive/signals?days=7`),
    staleTime: 60_000,
  });
}

/* ---------- Share of Model ---------- */

export function useTrend(
  weeks?: number,
  category?: string,
  promptId?: string,
  branding?: string,
  audience?: string,
) {
  const params = new URLSearchParams();
  if (weeks) params.set("weeks", String(weeks));
  if (category) params.set("category", category);
  if (promptId) params.set("prompt_id", promptId);
  if (branding) params.set("branding", branding);
  if (audience) params.set("audience", audience);
  const qs = params.toString();
  return useQuery({
    queryKey: ["som", "trend", weeks, category, promptId, branding, audience],
    queryFn: () => getJSON<any>(`/som/trend${qs ? `?${qs}` : ""}`),
    staleTime: 60_000,
  });
}

export function useShares(branding?: string, audience?: string) {
  const params = new URLSearchParams();
  if (branding) params.set("branding", branding);
  if (audience) params.set("audience", audience);
  const qs = params.toString();
  return useQuery({
    queryKey: ["som", "shares", branding, audience],
    queryFn: () => getJSON<any>(`/som/shares${qs ? `?${qs}` : ""}`),
    staleTime: 60_000,
  });
}

export function useCompanies(branding?: string, audience?: string) {
  const params = new URLSearchParams();
  if (branding) params.set("branding", branding);
  if (audience) params.set("audience", audience);
  const qs = params.toString();
  return useQuery({
    queryKey: ["som", "companies", branding, audience],
    queryFn: () => getJSON<any>(`/som/companies${qs ? `?${qs}` : ""}`),
    staleTime: 60_000,
  });
}

export function usePrompts() {
  return useQuery({
    queryKey: ["som", "prompts"],
    queryFn: () => getJSON<any>(`/som/prompts`),
    staleTime: 5 * 60_000,
  });
}

export function useStatus() {
  return useQuery({
    queryKey: ["som", "status"],
    queryFn: () => getJSON<any>(`/som/status`),
    staleTime: 30_000,
  });
}

export function useSources(days = 30) {
  return useQuery({
    queryKey: ["som", "sources", days],
    queryFn: () => getJSON<SourceData>(`/som/sources?days=${days}`),
    staleTime: 60_000,
  });
}

export function useRecommendations() {
  return useQuery({
    queryKey: ["recommendations"],
    queryFn: () => getJSON<any>(`/recommendations`),
    staleTime: 60_000,
  });
}
