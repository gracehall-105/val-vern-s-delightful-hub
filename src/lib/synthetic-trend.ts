/**
 * Synthetic weekly Share-of-Model trend used when the backend hasn't been
 * connected yet (or for design/demo purposes).
 *
 * Two things this dataset is intentionally designed to demonstrate:
 *   1. A missing measurement week (Jul 5 – Jul 11) — the timeline is
 *      preserved, the bar is rendered as a hatched blank slot, and
 *      week-over-week deltas that touch the gap are shown as "—".
 *   2. A growing prompt universe over time (10 → 157 → 180 → 348 → 444).
 *      The chart renders grouping brackets under the x-axis (one bracket
 *      per plateau, labeled with the prompt count) and a "+N prompts"
 *      chip above each week where the universe expanded.
 */

export interface SyntheticTrendWeek {
  date: string; // Sunday (start of ISO week) YYYY-MM-DD
  shares: Record<string, number>;
  prompt_count: number;
  missing?: boolean;
}

export const SYNTHETIC_TREND: SyntheticTrendWeek[] = [
  {
    date: "2026-05-03",
    prompt_count: 10,
    shares: { Voya: 24, Fidelity: 22, Vanguard: 18, Schwab: 14, Empower: 8, TIAA: 6, Principal: 5, Prudential: 3 },
  },
  {
    date: "2026-05-10",
    prompt_count: 157,
    shares: { Voya: 5, Fidelity: 28, Vanguard: 23, Schwab: 18, Empower: 10, TIAA: 7, Principal: 5, Prudential: 4 },
  },
  {
    date: "2026-05-17",
    prompt_count: 180,
    shares: { Voya: 3, Fidelity: 29, Vanguard: 23, Schwab: 18, Empower: 10, TIAA: 7, Principal: 6, Prudential: 4 },
  },
  {
    date: "2026-05-24",
    prompt_count: 180,
    shares: { Voya: 4, Fidelity: 28, Vanguard: 23, Schwab: 18, Empower: 10, TIAA: 7, Principal: 6, Prudential: 4 },
  },
  {
    date: "2026-05-31",
    prompt_count: 180,
    shares: { Voya: 5, Fidelity: 28, Vanguard: 22, Schwab: 18, Empower: 10, TIAA: 7, Principal: 6, Prudential: 4 },
  },
  {
    date: "2026-06-07",
    prompt_count: 348,
    shares: { Voya: 6, Fidelity: 27, Vanguard: 22, Schwab: 18, Empower: 10, TIAA: 7, Principal: 6, Prudential: 4 },
  },
  {
    date: "2026-06-14",
    prompt_count: 348,
    shares: { Voya: 7, Fidelity: 26, Vanguard: 22, Schwab: 18, Empower: 10, TIAA: 7, Principal: 6, Prudential: 4 },
  },
  {
    date: "2026-06-21",
    prompt_count: 348,
    shares: { Voya: 8, Fidelity: 25, Vanguard: 22, Schwab: 18, Empower: 10, TIAA: 7, Principal: 6, Prudential: 4 },
  },
  {
    date: "2026-06-28",
    prompt_count: 444,
    shares: { Voya: 9, Fidelity: 25, Vanguard: 21, Schwab: 18, Empower: 10, TIAA: 7, Principal: 6, Prudential: 4 },
  },
  {
    date: "2026-07-05",
    prompt_count: 0,
    missing: true,
    shares: {},
  },
  {
    date: "2026-07-12",
    prompt_count: 444,
    shares: { Voya: 10, Fidelity: 24, Vanguard: 21, Schwab: 18, Empower: 10, TIAA: 7, Principal: 6, Prudential: 4 },
  },
];
