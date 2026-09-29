/**
 * Biomarker categories shown in marketing. These describe areas of measurement
 * only — never outcomes, conditions or diagnoses.
 *
 * TODO(placeholder): `count` and `examples` are ILLUSTRATIVE placeholders.
 * Replace with the real analyte lists per product supplied by Express Pathology
 * before launch. Marker names only — no disease names, no diagnostic claims.
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
  /** Number of markers in this category. TODO(placeholder). */
  count: number;
  /** 4–5 example markers. TODO(placeholder). */
  examples: string[];
}

export const biomarkerCategories: BiomarkerCategory[] = [
  {
    id: "hormones",
    name: "Hormones",
    description: "Key hormones involved in energy, mood, reproduction and body composition.",
    count: 8,
    examples: ["Testosterone", "Oestradiol", "SHBG", "FSH", "LH"],
  },
  {
    id: "metabolic",
    name: "Metabolic health",
    description: "Blood sugar and related markers, including HbA1c.",
    count: 4,
    examples: ["HbA1c", "Fasting glucose", "Insulin", "Uric acid"],
  },
  {
    id: "cardiovascular",
    name: "Heart health",
    description: "Cholesterol and lipid markers linked to cardiovascular health.",
    count: 6,
    examples: ["Total cholesterol", "LDL cholesterol", "HDL cholesterol", "Triglycerides", "ApoB"],
  },
  {
    id: "liver",
    name: "Liver",
    description: "Enzymes and proteins that reflect how your liver is working.",
    count: 6,
    examples: ["ALT", "AST", "GGT", "ALP", "Bilirubin"],
  },
  {
    id: "kidney",
    name: "Kidney",
    description: "Markers of kidney filtration and electrolyte balance.",
    count: 6,
    examples: ["Creatinine", "eGFR", "Urea", "Sodium", "Potassium"],
  },
  {
    id: "thyroid",
    name: "Thyroid",
    description: "Thyroid hormones that help regulate metabolism.",
    count: 3,
    examples: ["TSH", "Free T4", "Free T3"],
  },
  {
    id: "nutrients",
    name: "Nutrients",
    description: "Iron stores, vitamin D, B12 and other essential nutrients.",
    count: 6,
    examples: ["Ferritin", "Iron", "Vitamin D", "Vitamin B12", "Folate"],
  },
  {
    id: "inflammation",
    name: "Inflammation",
    description: "General markers of inflammation in the body.",
    count: 2,
    examples: ["hs-CRP", "ESR"],
  },
  {
    id: "performance",
    name: "Performance and recovery",
    description: "Markers related to muscle, recovery and training load.",
    count: 5,
    examples: ["Creatine kinase", "Magnesium", "Cortisol", "Zinc", "Haemoglobin"],
  },
];

/** Total marker count across all categories (placeholder until real lists exist). */
export const totalMarkerCount = () => biomarkerCategories.reduce((n, c) => n + c.count, 0);
