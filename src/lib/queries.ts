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
