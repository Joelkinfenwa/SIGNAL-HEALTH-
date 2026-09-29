import { biomarkerCategories, groupByCategory, type BiomarkerCategoryId } from "./biomarkers";

export type ProductTier = "core" | "complete" | "hormones" | "performance" | "longevity";
export type CollectionMethod = "mobile" | "centre";

export interface Product {
  id: string;
  slug: string;
  tier: ProductTier;
  name: string;
  /** Short label for tight spaces (tables, mobile). */
  shortName: string;
  /**
   * Price in cents, AUD, or null while pricing is not yet set.
   * The server is always the source of truth for price at checkout.
   * TODO(pricing): set once lab COGS are confirmed.
   */
  priceCents: number | null;
  tagline: string;
  /** One sentence: what this test helps you understand. Areas of measurement only, never conditions. */
  helps: string;
  /** The question the product answers, in the customer's words. */
  question: string;
  forWho: string[];
  /** Marker ids from config/biomarkers.ts. Counts and groupings are derived from this. */
  markers: string[];
  /** Markers being considered for this panel, pending cost/clinical rationale. Not rendered. */
  underConsideration?: string[];
  /** The panel this one builds on, for "everything in X, plus" presentations. */
  buildsOn?: ProductTier;
  /** Audience note shown on the product page (e.g. male-oriented initial panel). */
  audienceNote?: string;
  collectionMethods: CollectionMethod[];
  /** Marks the default/recommended option. Do not label it "most popular" until sales data supports it. */
  featured: boolean;
  /** Category ids to lead with in compact presentations (max 4). */
  highlights: BiomarkerCategoryId[];
}

const CORE_BASE = [
  "fbc",
  "glucose", "hba1c",
  "tc", "ldl", "hdl", "tg", "non_hdl",
  "alt", "ast", "alp", "ggt", "bilirubin", "albumin", "total_protein",
  "creatinine", "egfr", "urea", "sodium", "potassium", "chloride", "bicarbonate",
  "ferritin", "iron", "transferrin", "tsat",
  "tsh",
  "b12", "folate", "vit_d",
];
const LIVER = ["alt", "ast", "alp", "ggt", "bilirubin", "albumin", "total_protein"];
const KIDNEY = ["creatinine", "egfr", "urea", "sodium", "potassium", "chloride", "bicarbonate"];
const IRON = ["ferritin", "iron", "transferrin", "tsat"];

/**
 * Panel definitions per the product brief (docs/PANELS.md).
 * TODO-VERIFY: analyte availability and naming with the laboratory partner.
 * TODO(pricing): all prices null until set.
 */
export const products: Product[] = [
  {
    id: "prod_core",
    slug: "core",
    tier: "core",
    name: "SIGNAL Core",
    shortName: "Core",
    priceCents: null,
    tagline: "A genuinely useful picture of your health.",
    helps: "How your body is working today: blood, sugar, cholesterol, liver, kidneys, iron, thyroid, nutrients and inflammation.",
    question: "How is my body doing, overall?",
    forWho: ["Your first comprehensive blood test", "A yearly health check-in", "A solid baseline to retest against"],
    markers: [...CORE_BASE, "crp"],
    underConsideration: ["hscrp"],
    collectionMethods: ["mobile", "centre"],
    featured: false,
    highlights: ["heart", "metabolic", "iron", "nutrients"],
  },
  {
    id: "prod_complete",
    slug: "complete",
    tier: "complete",
    name: "SIGNAL Complete",
    shortName: "Complete",
    priceCents: null,
    tagline: "If you're getting blood taken anyway, get this one.",
    helps: "Everything in Core, with real depth: advanced heart particles, a full thyroid picture, hormones, insulin and minerals.",
    question: "What's the full picture of how my body is working?",
    forWho: ["Understanding energy, mood and sleep", "A deeper look at heart and metabolic health", "Tracking change over time"],
    markers: [
      ...CORE_BASE, "hscrp",
      "apob", "apoa1", "lpa", "apob_apoa1", "tg_hdl",
      "ft4", "ft3",
      "testosterone", "shbg", "free_t", "lh", "fsh", "oestradiol", "prolactin",
      "insulin", "homa_ir",
      "magnesium", "calcium", "phosphate", "zinc",
    ],
    underConsideration: ["dheas"],
    buildsOn: "core",
    collectionMethods: ["mobile", "centre"],
    featured: true,
    highlights: ["heart", "hormones", "metabolic", "thyroid"],
  },
  {
    id: "prod_hormones",
    slug: "hormones",
    tier: "hormones",
    name: "SIGNAL Hormones",
    shortName: "Hormones",
    priceCents: null,
    tagline: "Understand your hormones, in context.",
    helps: "Your key hormones and the signals that drive them, alongside the markers that put them in context.",
    question: "Where do my hormones sit, and what's around them?",
    forWho: ["Understanding energy, drive and recovery", "A clear hormone baseline to retest against"],
    // Initial panel is male-oriented. TODO(decision): sex-specific variants rather than one panel for everyone.
    audienceNote: "This first version of the Hormones panel is designed around male hormone markers. Versions designed for women are planned.",
    markers: [
      "testosterone", "shbg", "free_t", "lh", "fsh", "oestradiol", "prolactin", "dheas",
      "tsh", "ft4",
      "fbc", "ferritin", "vit_d", "hba1c",
      ...LIVER,
    ],
    underConsideration: ["psa"],
    collectionMethods: ["mobile", "centre"],
    featured: false,
    highlights: ["hormones", "thyroid", "iron", "liver"],
  },
  {
    id: "prod_performance",
    slug: "performance",
    tier: "performance",
    name: "SIGNAL Performance",
    shortName: "Performance",
    priceCents: null,
    tagline: "Built for people who train.",
    helps: "The markers that relate to energy, oxygen carrying, muscle load, stress and recovery, for people who train seriously.",
    question: "Is there anything measurable holding back my performance, energy or recovery?",
    forWho: ["Regular training or competition", "Running, cycling, lifting or endurance sport", "Detailed tracking of recovery"],
    markers: [
      "fbc",
      ...IRON,
      "ck",
      "glucose", "hba1c", "insulin", "homa_ir",
      ...KIDNEY,
      ...LIVER,
      "hscrp",
      "testosterone", "shbg", "free_t", "cortisol",
      "tsh", "ft4", "ft3",
      "vit_d", "b12", "folate", "magnesium", "zinc",
    ],
    underConsideration: ["oestradiol", "igf1"],
    collectionMethods: ["mobile", "centre"],
    featured: false,
    highlights: ["recovery", "iron", "hormones", "metabolic"],
  },
  {
    id: "prod_longevity",
    slug: "longevity",
    tier: "longevity",
    name: "SIGNAL Longevity",
    shortName: "Longevity",
    priceCents: null,
    tagline: "The long game, measured.",
    helps: "A strong general health foundation plus the advanced heart and metabolic markers that matter over decades.",
    question: "What do the markers that matter over the long run look like for me?",
    forWho: ["Thinking in decades, not weeks", "A deep heart and metabolic baseline", "Tracking the slow-moving numbers"],
    markers: [
      ...CORE_BASE, "hscrp",
      "apob", "apoa1", "lpa", "apob_apoa1", "tg_hdl",
      "insulin", "homa_ir", "uric_acid",
    ],
    buildsOn: "core",
    collectionMethods: ["mobile", "centre"],
    featured: false,
    highlights: ["heart", "metabolic", "inflammation", "kidney"],
  },
];

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);
export const getProductByTier = (tier: ProductTier) => products.find((p) => p.tier === tier);
export const featuredProduct = () => products.find((p) => p.featured) ?? products[0]!;

/** Lowest set price across products, or null while no product has a price. */
export const lowestPriceCents = (): number | null => {
  const prices = products.map((p) => p.priceCents).filter((p): p is number => p !== null);
  return prices.length ? Math.min(...prices) : null;
};
export const hasPricing = () => lowestPriceCents() !== null;

/** Categories a product covers, in display order. */
export const productCategories = (p: Product) => groupByCategory(p.markers).map((g) => g.category);
export const productCategoryCount = (p: Product) => productCategories(p).length;
export const productMarkerCount = (p: Product) => p.markers.length;

/** Markers in `p` that are not in the panel it builds on. */
export function addedMarkers(p: Product): string[] {
  const base = p.buildsOn ? getProductByTier(p.buildsOn) : undefined;
  if (!base) return p.markers;
  const baseSet = new Set(base.markers);
  return p.markers.filter((m) => !baseSet.has(m));
}

/** Which products include a given category. */
export const productsWithCategory = (categoryId: BiomarkerCategoryId) =>
  products.filter((p) => productCategories(p).some((c) => c.id === categoryId));

/** Union of every marker in any panel, for the "what we measure" overview. */
export const allPanelMarkers = () => Array.from(new Set(products.flatMap((p) => p.markers)));

export const totalCategoryCount = () => biomarkerCategories.filter((c) => productsWithCategory(c.id).length > 0).length;
