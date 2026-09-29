/**
 * Customer interests: what someone wants to understand. Used by the quiz and
 * by add-on recommendations. Interests are preferences, never symptoms or
 * conditions, and never leave the browser as analytics properties.
 */
export type InterestId =
  | "general"
  | "energy"
  | "hormones"
  | "heart"
  | "training"
  | "nutrition"
  | "metabolic"
  | "thyroid"
  | "ageing";

export interface Interest {
  id: InterestId;
  label: string;
  hint?: string;
}

export const interests: Interest[] = [
  { id: "general", label: "General health", hint: "A proper all-round baseline" },
  { id: "energy", label: "Energy" },
  { id: "hormones", label: "Hormones" },
  { id: "heart", label: "Heart health" },
  { id: "training", label: "Training and recovery" },
  { id: "nutrition", label: "Nutrition" },
  { id: "metabolic", label: "Metabolic health", hint: "Blood sugar and insulin" },
  { id: "thyroid", label: "Thyroid" },
  { id: "ageing", label: "Healthy ageing" },
];
