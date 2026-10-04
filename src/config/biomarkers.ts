/**
 * Biomarker catalogue.
 *
 * Single source of truth for every marker SIGNAL can measure or calculate.
 * Products and add-ons reference markers by id; counts and groupings are
 * derived, never hand-maintained.
 *
 * COMPLIANCE: descriptions say what a marker MEASURES (a substance, a count,
 * a calculation). They never name diseases, conditions, diagnoses or
 * treatments. "What you'll learn" is about understanding, not detecting.
 *
 * TODO-VERIFY: marker availability, naming and which are lab-reported vs.
 * calculated need confirmation with the laboratory partner (4Cyte / ACL).
 */
export type BiomarkerCategoryId =
  | "heart"
  | "hormones"
  | "metabolic"
  | "thyroid"
  | "nutrients"
  | "iron"
  | "inflammation"
  | "liver"
  | "kidney"
  | "electrolytes"
  | "minerals"
  | "blood"
  | "recovery";

export interface BiomarkerCategory {
  id: BiomarkerCategoryId;
  name: string;
  /** Plain-language line for "what you'll learn" presentations. */
  learn: string;
  description: string;
}

/** Display order matters: the most compelling groups first. */
export const biomarkerCategories: BiomarkerCategory[] = [
  { id: "heart", name: "Heart", learn: "How your cholesterol, and the particles that carry it, are tracking.", description: "Cholesterol, triglycerides and the lipoprotein particles that carry them." },
  { id: "hormones", name: "Hormones", learn: "Where your key hormones sit and how they relate to each other.", description: "Sex hormones and the signals that regulate them." },
  { id: "metabolic", name: "Metabolic", learn: "How your body handles sugar, day to day and over months.", description: "Blood sugar, insulin and related markers." },
  { id: "thyroid", name: "Thyroid", learn: "How the gland that sets your metabolic pace is signalling.", description: "Thyroid hormones and the signal that controls them." },
  { id: "nutrients", name: "Nutrients", learn: "Whether the vitamins and minerals your body relies on are where they should be.", description: "Vitamins and minerals your body needs to function." },
  { id: "iron", name: "Iron", learn: "How much iron you have stored and how well it's being carried.", description: "Iron stores and the proteins that transport iron." },
  { id: "inflammation", name: "Inflammation", learn: "Your general level of inflammation right now.", description: "General markers of inflammation in the body." },
  { id: "liver", name: "Liver", learn: "How your liver is working, from enzymes to the proteins it makes.", description: "Enzymes and proteins that reflect how your liver is working." },
  { id: "kidney", name: "Kidneys", learn: "How well your kidneys are filtering.", description: "Markers of kidney filtration." },
  { id: "electrolytes", name: "Electrolytes", learn: "Whether the salts that keep fluid, nerves and muscle in balance are where they should be.", description: "Sodium, potassium, chloride and bicarbonate." },
  { id: "minerals", name: "Minerals", learn: "The minerals your bones, muscles and energy systems depend on.", description: "Calcium, magnesium, phosphate and uric acid." },
  { id: "blood", name: "Blood", learn: "The cells that carry oxygen, fight infection and help you clot.", description: "Red cells, white cells, haemoglobin and platelets." },
  { id: "recovery", name: "Recovery", learn: "What your body is telling you about training load, stress and recovery.", description: "Markers related to muscle load, stress and recovery." },
];

export interface Biomarker {
  id: string;
  name: string;
  /** Short form for chips and tables. */
  short?: string;
  category: BiomarkerCategoryId;
  /** One line: what it measures. Never a condition. */
  about: string;
  /** Calculated from other markers already in the panel — no extra assay. */
  derivedFrom?: string[];
}

export const biomarkers: Biomarker[] = [
  // Blood
  { id: "fbc", name: "Full blood count", short: "FBC", category: "blood", about: "Red cells, white cells, haemoglobin and platelets in one count." },

  // Metabolic
  { id: "glucose", name: "Fasting glucose", category: "metabolic", about: "Sugar in your blood after fasting." },
  { id: "hba1c", name: "HbA1c", category: "metabolic", about: "Your average blood sugar over roughly the last three months." },
  { id: "insulin", name: "Fasting insulin", category: "metabolic", about: "The hormone that moves sugar out of your blood, measured after fasting." },
  { id: "homa_ir", name: "HOMA-IR", category: "metabolic", about: "A calculated view of how your body responds to insulin.", derivedFrom: ["glucose", "insulin"] },
  { id: "uric_acid", name: "Uric acid", category: "minerals", about: "A waste product from the breakdown of purines." },

  // Heart
  { id: "tc", name: "Total cholesterol", category: "heart", about: "All the cholesterol carried in your blood." },
  { id: "ldl", name: "LDL cholesterol", short: "LDL-C", category: "heart", about: "Cholesterol carried by low-density particles." },
  { id: "hdl", name: "HDL cholesterol", short: "HDL-C", category: "heart", about: "Cholesterol carried by high-density particles." },
  { id: "tg", name: "Triglycerides", category: "heart", about: "The main form of fat carried in your blood." },
  { id: "non_hdl", name: "Non-HDL cholesterol", short: "Non-HDL-C", category: "heart", about: "All cholesterol except HDL, calculated from your lipid results.", derivedFrom: ["tc", "hdl"] },
  { id: "apob", name: "ApoB", category: "heart", about: "The protein on every particle that carries cholesterol to your tissues." },
  { id: "apoa1", name: "ApoA1", category: "heart", about: "The main protein on HDL particles." },
  { id: "lpa", name: "Lp(a)", category: "heart", about: "A cholesterol-carrying particle whose level is largely set by your genes." },
  { id: "apob_apoa1", name: "ApoB:ApoA1 ratio", category: "heart", about: "The balance between the two particle types, calculated.", derivedFrom: ["apob", "apoa1"] },
  { id: "tg_hdl", name: "Triglyceride:HDL ratio", short: "TG:HDL", category: "heart", about: "A calculated ratio from your lipid results.", derivedFrom: ["tg", "hdl"] },

  // Liver
  { id: "alt", name: "ALT", category: "liver", about: "An enzyme found mainly in liver cells." },
  { id: "ast", name: "AST", category: "liver", about: "An enzyme found in the liver and muscle." },
  { id: "alp", name: "ALP", category: "liver", about: "An enzyme from the liver, bile ducts and bone." },
  { id: "ggt", name: "GGT", category: "liver", about: "An enzyme involved in moving molecules across liver cells." },
  { id: "bilirubin", name: "Bilirubin", category: "liver", about: "A pigment made when red cells are broken down and processed by the liver." },
  { id: "albumin", name: "Albumin", category: "liver", about: "The main protein your liver makes." },
  { id: "total_protein", name: "Total protein", category: "liver", about: "All the proteins circulating in your blood." },

  // Kidney and electrolytes
  { id: "creatinine", name: "Creatinine", category: "kidney", about: "A waste product from muscle that your kidneys clear." },
  { id: "egfr", name: "eGFR", category: "kidney", about: "An estimate of how much blood your kidneys filter each minute.", derivedFrom: ["creatinine"] },
  { id: "urea", name: "Urea", category: "kidney", about: "A waste product from protein breakdown, cleared by the kidneys." },
  { id: "sodium", name: "Sodium", category: "electrolytes", about: "An electrolyte that helps regulate fluid balance." },
  { id: "potassium", name: "Potassium", category: "electrolytes", about: "An electrolyte important for nerves and muscle." },
  { id: "chloride", name: "Chloride", category: "electrolytes", about: "An electrolyte that works alongside sodium." },
  { id: "bicarbonate", name: "Bicarbonate", category: "electrolytes", about: "A measure of the acid-base balance in your blood." },

  // Iron
  { id: "ferritin", name: "Ferritin", category: "iron", about: "A protein that reflects how much iron you have stored." },
  { id: "iron", name: "Iron", category: "iron", about: "Iron currently circulating in your blood." },
  { id: "transferrin", name: "Transferrin", category: "iron", about: "The protein that carries iron around your body." },
  { id: "tsat", name: "Transferrin saturation", short: "TSAT", category: "iron", about: "How much of your iron-carrying capacity is in use, calculated.", derivedFrom: ["iron", "transferrin"] },

  // Thyroid
  { id: "tsh", name: "TSH", category: "thyroid", about: "The signal from your brain that tells the thyroid how much to produce." },
  { id: "ft4", name: "Free T4", short: "FT4", category: "thyroid", about: "The main hormone your thyroid releases, in its active form." },
  { id: "ft3", name: "Free T3", short: "FT3", category: "thyroid", about: "The more potent thyroid hormone, in its active form." },
  { id: "tpo_ab", name: "TPO antibodies", category: "thyroid", about: "Antibodies directed at thyroid peroxidase, an enzyme in the thyroid." },
  { id: "tg_ab", name: "Thyroglobulin antibodies", short: "Tg antibodies", category: "thyroid", about: "Antibodies directed at thyroglobulin, a protein made by the thyroid." },

  // Hormones
  { id: "testosterone", name: "Total testosterone", category: "hormones", about: "All the testosterone in your blood, bound and free." },
  { id: "shbg", name: "SHBG", category: "hormones", about: "The protein that binds sex hormones and controls how much is available." },
  { id: "free_t", name: "Free testosterone", category: "hormones", about: "The unbound, available portion, calculated from total testosterone, SHBG and albumin.", derivedFrom: ["testosterone", "shbg", "albumin"] },
  { id: "lh", name: "LH", category: "hormones", about: "A signal from the brain that drives hormone production." },
  { id: "fsh", name: "FSH", category: "hormones", about: "A signal from the brain involved in reproduction." },
  { id: "oestradiol", name: "Oestradiol", category: "hormones", about: "The main form of oestrogen." },
  { id: "prolactin", name: "Prolactin", category: "hormones", about: "A hormone from the pituitary that influences other hormones." },
  { id: "dheas", name: "DHEA-S", category: "hormones", about: "An adrenal hormone that your body converts into other hormones." },

  // Nutrients and minerals
  { id: "b12", name: "Vitamin B12", category: "nutrients", about: "A vitamin your body uses for nerves and red cells." },
  { id: "folate", name: "Folate", category: "nutrients", about: "A B vitamin your body uses to make new cells." },
  { id: "vit_d", name: "Vitamin D", category: "nutrients", about: "A nutrient your body uses for bone and muscle health." },
  { id: "magnesium", name: "Magnesium", category: "minerals", about: "A mineral involved in muscle, nerve and energy processes." },
  { id: "calcium", name: "Calcium", category: "minerals", about: "A mineral your bones, muscles and nerves rely on." },
  { id: "phosphate", name: "Phosphate", category: "minerals", about: "A mineral that works with calcium in bone and energy processes." },
  { id: "zinc", name: "Zinc", category: "nutrients", about: "A mineral involved in immunity, healing and hormone production." },

  // Inflammation
  { id: "crp", name: "CRP", category: "inflammation", about: "A protein that rises with inflammation." },
  { id: "hscrp", name: "hs-CRP", category: "inflammation", about: "A high-sensitivity measure of the same inflammation protein, picking up lower levels." },

  // Recovery
  { id: "ck", name: "Creatine kinase", short: "CK", category: "recovery", about: "An enzyme released from muscle after hard work." },
  { id: "cortisol", name: "Cortisol", category: "recovery", about: "Your main stress hormone, which follows a daily rhythm." },
  { id: "igf1", name: "IGF-1", category: "recovery", about: "A growth-related hormone linked to recovery and adaptation." },

  // Under review: not in any panel by default
  { id: "psa", name: "PSA", category: "hormones", about: "A protein made by the prostate." },
];

const byId = new Map(biomarkers.map((m) => [m.id, m]));
export const getBiomarker = (id: string): Biomarker => {
  const m = byId.get(id);
  if (!m) throw new Error(`Unknown biomarker id: ${id}`);
  return m;
};
export const getCategory = (id: BiomarkerCategoryId) => biomarkerCategories.find((c) => c.id === id)!;

/** Group a list of marker ids by category, preserving the category display order. */
export function groupByCategory(ids: readonly string[]): { category: BiomarkerCategory; markers: Biomarker[] }[] {
  const set = new Set(ids);
  return biomarkerCategories
    .map((category) => ({ category, markers: biomarkers.filter((m) => set.has(m.id) && m.category === category.id) }))
    .filter((g) => g.markers.length > 0);
}

export const derivedMarkers = (ids: readonly string[]) => ids.map(getBiomarker).filter((m) => m.derivedFrom);
export const measuredMarkers = (ids: readonly string[]) => ids.map(getBiomarker).filter((m) => !m.derivedFrom);
