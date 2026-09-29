import { groupByCategory } from "./biomarkers";
import type { CollectionMethodId } from "./collection";

/**
 * THE SIGNAL TEST — the one flagship product. SIGNAL = breadth; add-ons = depth.
 *
 * Everything customer-facing about the product derives from this record:
 * markers (and therefore counts and categories), price, collection options,
 * which add-ons and retesting plans apply. Change a price here and it changes
 * everywhere. Never hard-code any of this in components.
 *
 * PROVISIONAL: the panel below is the brief's provisional composition.
 * TODO-VERIFY with the laboratory partner. TODO(pricing): prices null until set.
 */
export type ProductId = "signal";

export interface Product {
  id: ProductId;
  sku: string;
  name: string;
  /** Short form: "SIGNAL". */
  shortName: string;
  tagline: string;
  description: string;
  /** Price in cents, AUD. null until pricing is set. Server is truth at checkout. */
  priceCents: number | null;
  /** Strike-through reference price, if used. null = none. */
  compareAtPriceCents: number | null;
  /** Marker ids from config/biomarkers.ts. Counts and categories are derived. */
  markerIds: string[];
  /** Markers under consideration for the base panel; not rendered. */
  underConsideration?: string[];
  collectionMethodIds: CollectionMethodId[];
  /** Add-on ids offered with this product (config/addons.ts). */
  addonIds: string[];
  /** Retesting plan ids that apply (config/retest-offer.ts). */
  retestOfferIds: string[];
  /** Categories to lead with in compact presentations. */
  highlights: string[];
}

/** DECISION: hs-CRP or standard CRP in the base panel. Flip here. */
export const BASE_INFLAMMATION_MARKER: "hscrp" | "crp" = "hscrp";

export const signalTest: Product = {
  id: "signal",
  sku: "SIGNAL-TEST",
  name: "The SIGNAL Test",
  shortName: "SIGNAL",
  tagline: "One comprehensive blood test. A clearer picture of what's happening inside your body.",
  description:
    "The major areas of your health measured from one sample, collected at a centre or at home, reviewed, and explained in plain language. Go deeper where it matters to you with optional add-ons.",
  priceCents: null,
  compareAtPriceCents: null,
  markerIds: [
    // Blood
    "fbc",
    // Iron
    "ferritin", "iron", "transferrin", "tsat",
    // Heart
    "tc", "ldl", "hdl", "tg", "non_hdl",
    // Metabolic / blood sugar
    "glucose", "hba1c",
    // Liver
    "alt", "ast", "alp", "ggt", "bilirubin", "albumin", "total_protein",
    // Kidney
    "creatinine", "egfr", "urea",
    // Electrolytes
    "sodium", "potassium", "chloride", "bicarbonate",
    // Thyroid
    "tsh",
    // Hormones (calculated free testosterone where laboratory-appropriate)
    "testosterone", "shbg", "free_t",
    // Nutrients
    "vit_d", "b12", "folate",
    // Inflammation
    BASE_INFLAMMATION_MARKER,
    // Minerals / other
    "calcium", "magnesium", "phosphate", "uric_acid",
  ],
  collectionMethodIds: ["centre", "mobile"],
  addonIds: ["hormones_plus", "heart_plus", "thyroid_plus", "performance_plus", "metabolic_plus", "nutrients_plus"],
  retestOfferIds: ["retest_6m", "retest_3m"],
  highlights: ["heart", "hormones", "metabolic", "thyroid", "nutrients", "iron"],
};

/** All products (one today). Kept as a list so a second product never means a refactor. */
export const products: Product[] = [signalTest];
export const getProduct = (id: string) => products.find((p) => p.id === id);

export const productCategories = (p: Product = signalTest) => groupByCategory(p.markerIds).map((g) => g.category);
export const productCategoryCount = (p: Product = signalTest) => productCategories(p).length;
export const productMarkerCount = (p: Product = signalTest) => p.markerIds.length;
export const hasPricing = () => signalTest.priceCents !== null;
