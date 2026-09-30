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
 * ARCHITECTURE DECISION (product): the base test covers the ten core areas
 * below. Hormones (testosterone, SHBG, free T) and vitamins (D, B12, folate)
 * are deliberately NOT in the base — they live in Hormones+ and Nutrients+.
 * Do not add them back here.
 *
 * TODO-VERIFY analyte availability with the laboratory partner.
 * TODO(pricing): prices null until set.
 */
export type ProductId = "signal";

export interface Product {
  id: ProductId;
  sku: string;
  /** URL slug: /signal */
  slug: string;
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
  /** Add-on ids offered with this product, in display order (config/addons.ts). */
  addonIds: string[];
  /** Retesting plan ids that apply (config/retest-offer.ts). */
  retestOfferIds: string[];
  /** Categories to lead with in compact presentations. */
  highlights: string[];
  /** false hides the product everywhere (kept for a future second product). */
  enabled: boolean;
}

/** DECISION: hs-CRP or standard CRP in the base panel. Flip here. */
export const BASE_INFLAMMATION_MARKER: "hscrp" | "crp" = "hscrp";

export const signalTest: Product = {
  id: "signal",
  sku: "SIGNAL-TEST",
  slug: "signal",
  name: "The SIGNAL Test",
  shortName: "SIGNAL",
  tagline: "One comprehensive blood test. A clearer picture of what's happening inside your body.",
  description:
    "The major areas of your health measured from one sample, collected at a centre or at home, reviewed, and explained in plain language. Go deeper where it matters to you with optional add-ons.",
  priceCents: null,
  compareAtPriceCents: null,
  markerIds: [
    // Heart (5)
    "tc", "ldl", "hdl", "tg", "non_hdl",
    // Metabolic / blood sugar (2)
    "glucose", "hba1c",
    // Thyroid (1)
    "tsh",
    // Iron (4)
    "ferritin", "iron", "transferrin", "tsat",
    // Inflammation (1)
    BASE_INFLAMMATION_MARKER,
    // Liver (7)
    "alt", "ast", "alp", "ggt", "bilirubin", "albumin", "total_protein",
    // Kidneys (3)
    "creatinine", "egfr", "urea",
    // Electrolytes (4)
    "sodium", "potassium", "chloride", "bicarbonate",
    // Minerals (4)
    "calcium", "magnesium", "phosphate", "uric_acid",
    // Blood (1: full blood count)
    "fbc",
  ],
  collectionMethodIds: ["centre", "mobile"],
  // Display order of add-ons in the configurator and checkout. CRO-testable: reorder here.
  addonIds: ["hormones_plus", "nutrients_plus", "heart_plus", "thyroid_plus", "performance_plus"],
  retestOfferIds: ["retest_6m", "retest_3m"],
  highlights: ["heart", "metabolic", "thyroid", "iron", "liver", "blood"],
  enabled: true,
};

/** All products (one today). Kept as a list so a second product never means a refactor. */
export const products: Product[] = [signalTest];
export const getProduct = (id: string) => products.find((p) => p.id === id && p.enabled);

export const productCategories = (p: Product = signalTest) => groupByCategory(p.markerIds).map((g) => g.category);
export const productCategoryCount = (p: Product = signalTest) => productCategories(p).length;
export const productMarkerCount = (p: Product = signalTest) => p.markerIds.length;
export const hasPricing = () => signalTest.priceCents !== null;
