/**
 * "SIGNAL vs a standard check-up" comparison rows.
 *
 * COMPLIANCE: every row must be factual and substantiable under Australian
 * Consumer Law. All rows are TODO-VERIFY until someone signs them off by
 * setting `verified: true`. Rows are phrased neutrally — no disparagement of
 * GPs or other providers, no diagnostic claims.
 */
export interface ComparisonRow {
  id: string;
  label: string;
  signal: string;
  standard: string;
  /** TODO-VERIFY: set to true once substantiated and approved. */
  verified: boolean;
}

export const comparisonColumns = { signal: "SIGNAL", standard: "A standard check-up" } as const;

export const comparisonRows: ComparisonRow[] = [
  {
    id: "scope",
    label: "What's measured",
    signal: "Up to {areas} areas of health in one test",
    standard: "Usually a smaller set of tests chosen for a specific reason",
    verified: false,
  },
  {
    id: "where",
    label: "Where it's collected",
    signal: "At home or work where available, or a collection centre",
    standard: "Usually a collection centre",
    verified: false,
  },
  {
    id: "results",
    label: "How you get results",
    signal: "Plain-language explanations in your own dashboard",
    standard: "Typically a report of numbers, discussed at a follow-up",
    verified: false,
  },
  {
    id: "tracking",
    label: "Tracking over time",
    signal: "Retesting is built in, with change shown between tests",
    standard: "Usually a one-off, repeated if requested",
    verified: false,
  },
  {
    id: "start",
    label: "How to start",
    signal: "Choose a test online in a few minutes",
    standard: "Book an appointment first",
    verified: false,
  },
];
