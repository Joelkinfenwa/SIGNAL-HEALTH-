/**
 * Example results used to SHOW what a SIGNAL report looks like on marketing
 * pages. Every number here is invented for one fictional person ("Alex
 * Example") and is labelled as an example wherever it renders. Nothing is a
 * real result, a target, or health advice. Ranges mirror common laboratory
 * intervals only so the illustration is plausible.
 */
export const previewPerson = { firstName: "Alex", label: "Example, not a real person" };

export const previewSummary = { markers: 32, within: 31, outside: 1, collected: "1 September" };

export interface GaugeExample {
  name: string;
  area: string;
  value: string;
  unit: string;
  range: string;
  status: "in" | "out";
  /** Percent positions of the laboratory interval on the bar and of the result pin. */
  bandLeft: number;
  bandRight: number;
  pin: number;
  sentence: string;
}

export const previewGauges: GaugeExample[] = [
  { name: "LDL cholesterol", area: "Heart", value: "3.2", unit: "mmol/L", range: "<3.0", status: "out", bandLeft: 0, bandRight: 62, pin: 68, sentence: "Above the laboratory range. Flagged, explained, and whether to follow up with your GP." },
  { name: "Ferritin", area: "Iron", value: "96", unit: "ug/L", range: "30–300", status: "in", bandLeft: 18, bandRight: 82, pin: 36, sentence: "Within the laboratory range. You can still see exactly where it sits." },
  { name: "HbA1c", area: "Blood sugar", value: "5.3", unit: "%", range: "<6.0", status: "in", bandLeft: 0, bandRight: 70, pin: 54, sentence: "Within range. A three-month average, not a single morning." },
];

export const previewTrend = {
  name: "Total cholesterol",
  area: "Heart",
  unit: "mmol/L",
  points: [{ label: "Mar", value: 6.1 }, { label: "Jun", value: 5.8 }, { label: "Sep", value: 5.2 }],
  rangeHigh: 5.5,
  change: "5.8 → 5.2 since June · back within range",
};

export const previewSystems: { name: string; count: number; outside: number }[] = [
  { name: "Heart", count: 5, outside: 1 },
  { name: "Liver", count: 7, outside: 0 },
  { name: "Kidneys", count: 3, outside: 0 },
  { name: "Iron", count: 4, outside: 0 },
  { name: "Electrolytes", count: 4, outside: 0 },
  { name: "Minerals", count: 4, outside: 0 },
  { name: "Blood sugar", count: 2, outside: 0 },
  { name: "Thyroid", count: 1, outside: 0 },
  { name: "Inflammation", count: 1, outside: 0 },
  { name: "Blood count", count: 1, outside: 0 },
];
