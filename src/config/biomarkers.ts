/**
 * Biomarker categories shown in marketing. These describe areas of measurement
 * only — never outcomes, conditions or diagnoses.
 * TODO: final analyte lists per product to be supplied by Express Pathology.
 */
export type BiomarkerCategoryId =
  | "hormones"
  | "metabolic"
  | "cardiovascular"
  | "liver"
  | "kidney"
  | "thyroid"
  | "nutrients"
  | "inflammation"
  | "performance";

export interface BiomarkerCategory {
  id: BiomarkerCategoryId;
  name: string;
  description: string;
}

export const biomarkerCategories: BiomarkerCategory[] = [
  { id: "hormones", name: "Hormones", description: "Key hormones involved in energy, mood, reproduction and body composition." },
  { id: "metabolic", name: "Metabolic health", description: "Blood sugar and related markers, including HbA1c." },
  { id: "cardiovascular", name: "Heart health", description: "Cholesterol and lipid markers linked to cardiovascular health." },
  { id: "liver", name: "Liver", description: "Enzymes and proteins that reflect how your liver is working." },
  { id: "kidney", name: "Kidney", description: "Markers of kidney filtration and electrolyte balance." },
  { id: "thyroid", name: "Thyroid", description: "Thyroid hormones that help regulate metabolism." },
  { id: "nutrients", name: "Nutrients", description: "Iron stores, vitamin D, B12 and other essential nutrients." },
  { id: "inflammation", name: "Inflammation", description: "General markers of inflammation in the body." },
  { id: "performance", name: "Performance and recovery", description: "Markers related to muscle, recovery and training load." },
];
