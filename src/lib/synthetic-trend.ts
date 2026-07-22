/**
 * Synthetic weekly Share-of-Model trend used when the backend hasn't been
 * connected yet (or for design/demo purposes). Week 3 is intentionally
 * missing to demonstrate how Beacon handles a lost measurement week —
 * the timeline is preserved, the bar is rendered as a blank hatched slot,
 * and week-over-week deltas that touch the gap are shown as "—".
 */

export interface SyntheticTrendWeek {
  date: string; // Sunday (start of ISO week) YYYY-MM-DD
  shares: Record<string, number>;
  prompt_count: number;
  missing?: boolean;
}

export const SYNTHETIC_TREND: SyntheticTrendWeek[] = [
  {
    date: "2026-06-14",
    prompt_count: 444,
    shares: {
      Voya: 6,
      Fidelity: 27,
      Vanguard: 22,
      Schwab: 18,
      Empower: 10,
      TIAA: 7,
      Principal: 6,
      Prudential: 4,
    },
  },
  {
    date: "2026-06-21",
    prompt_count: 444,
    shares: {
      Voya: 7,
      Fidelity: 26,
      Vanguard: 22,
      Schwab: 18,
      Empower: 10,
      TIAA: 7,
      Principal: 6,
      Prudential: 4,
    },
  },
  {
    date: "2026-06-28",
    prompt_count: 0,
    missing: true,
    shares: {},
  },
  {
    date: "2026-07-05",
    prompt_count: 444,
    shares: {
      Voya: 8,
      Fidelity: 25,
      Vanguard: 22,
      Schwab: 18,
      Empower: 10,
      TIAA: 7,
      Principal: 6,
      Prudential: 4,
    },
  },
  {
    date: "2026-07-12",
    prompt_count: 444,
    shares: {
      Voya: 9,
      Fidelity: 25,
      Vanguard: 21,
      Schwab: 18,
      Empower: 10,
      TIAA: 7,
      Principal: 6,
      Prudential: 4,
    },
  },
  {
    date: "2026-07-19",
    prompt_count: 444,
    shares: {
      Voya: 10,
      Fidelity: 24,
      Vanguard: 21,
      Schwab: 18,
      Empower: 10,
      TIAA: 7,
      Principal: 6,
      Prudential: 4,
    },
  },
];
