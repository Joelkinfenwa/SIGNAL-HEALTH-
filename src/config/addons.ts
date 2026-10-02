/**
 * Add-ons: optional depth on top of THE SIGNAL TEST.
 *
 * SIGNAL = breadth; add-ons = depth. The base test must feel complete on its
 * own; add-ons are extra depth, never essentials held back.
 *
 * Flags:
 *  - `enabled`       false = does not exist for customers (never rendered anywhere).
 *  - `launchEnabled` false = exists but is not sellable yet: rendered as a
 *                    disabled "coming" card where SHOW_UNLAUNCHED_ADDONS is true,
 *                    never selectable, never priced, never recommended.
 *
 * Internal cost (COGS) is NOT part of this record on purpose: this module is
 * bundled into the browser. Costs live in config/internal/costs.ts, which is
 * server-only. Never add a cost field here.
 *
 * PROVISIONAL marker lists per the product architecture brief. TODO-VERIFY
 * assay availability with the laboratory partner. TODO(pricing): prices null until set.
 */
import type { InterestId } from "./interests";
import { resolvePrice } from "./pricing";
import { signalTest, type Product } from "./products";

/** Badge vocabulary. Use sparingly: at most one or two badges across the list. */
export type AddonBadge = "popular" | "recommended" | "for-performance" | "advanced";

export const addonBadgeLabels: Record<AddonBadge, string> = {
  popular: "Popular",
  recommended: "Recommended",
  "for-performance": "For performance",
  advanced: "Advanced",
};

export interface Addon {
  id: string;
  sku: string;
  /** URL / anchor slug. */
  slug: string;
  name: string;
  /** One line on the card. Benefit first, no conditions. */
  shortDescription: string;
  /** Expandable detail: what the markers are and why together. */
  longDescription: string;
  /** "For you if…": one plain situation, never a symptom or condition. */
  forWho: string;
  markerIds: string[];
  /** Markers being considered for this add-on; not rendered. */
  underConsideration?: string[];
  priceCents: number | null;
  enabled: boolean;
  launchEnabled: boolean;
  /**
   * Optional static badge. "popular" requires sales data before it is set
   * (Australian Consumer Law: no unsubstantiated popularity claims).
   * "recommended" is normally applied dynamically by a landing page or the quiz.
   */
  badge?: AddonBadge;
  recommendedFor: InterestId[];
}

/** Show add-ons that are enabled but not yet sellable as disabled "coming" cards. */
export const SHOW_UNLAUNCHED_ADDONS = true;

export const addons: Addon[] = [
  {
    id: "hormones_plus",
    sku: "ADD-HORM",
    slug: "hormones-plus",
    name: "Hormones+",
    shortDescription: "Your key sex hormones and the signals that regulate them.",
    longDescription:
      "Total testosterone, SHBG and calculated free testosterone show where your hormones sit and how much is actually available to your body. LH, FSH, oestradiol and prolactin add the signals that regulate them, so you see the system, not one number.",
    forWho: "You want to understand your hormones properly, not guess from how you feel.",
    markerIds: ["testosterone", "shbg", "free_t", "lh", "fsh", "oestradiol", "prolactin"],
    underConsideration: ["dheas"],
    priceCents: resolvePrice("hormones_plus", null),
    enabled: true,
    launchEnabled: true,
    recommendedFor: ["hormones", "energy", "training"],
  },
  {
    id: "nutrients_plus",
    sku: "ADD-NUTR",
    slug: "nutrients-plus",
    name: "Nutrients+",
    shortDescription: "Vitamin D, B12 and folate, measured rather than assumed.",
    longDescription:
      "The three nutrients people most often supplement without knowing where they sit. Measure first, then decide what's worth taking and what isn't.",
    forWho: "You take, or are thinking about taking, supplements.",
    markerIds: ["vit_d", "b12", "folate"],
    underConsideration: ["zinc"],
    priceCents: resolvePrice("nutrients_plus", null),
    enabled: true,
    launchEnabled: true,
    recommendedFor: ["nutrition", "energy", "training"],
  },
  {
    id: "heart_plus",
    sku: "ADD-HEART",
    slug: "heart-plus",
    name: "Heart+",
    shortDescription: "The particle-level cholesterol markers most check-ups never run.",
    longDescription:
      "ApoB counts the particles that carry cholesterol, ApoA1 the ones that help clear it, and Lp(a) is a marker set largely by your genes that most people have never had measured. Together they add depth to the standard lipid panel in every SIGNAL.",
    forWho: "Heart health matters to you and you want more than the standard cholesterol panel.",
    markerIds: ["apob", "apoa1", "lpa", "apob_apoa1"],
    priceCents: resolvePrice("heart_plus", null),
    enabled: true,
    launchEnabled: true,
    badge: "advanced",
    recommendedFor: ["heart", "ageing"],
  },
  {
    id: "thyroid_plus",
    sku: "ADD-THY",
    slug: "thyroid-plus",
    name: "Thyroid+",
    shortDescription: "The active thyroid hormones and antibodies, beyond TSH.",
    longDescription:
      "TSH, in every SIGNAL, is the control signal. Free T4 and free T3 are the hormones it controls, and two antibody markers add context that TSH alone can't. The full thyroid picture, not just the headline.",
    forWho: "You want the full thyroid picture, not just TSH.",
    markerIds: ["ft4", "ft3", "tpo_ab", "tg_ab"],
    priceCents: resolvePrice("thyroid_plus", null),
    enabled: true,
    launchEnabled: true,
    recommendedFor: ["thyroid", "energy"],
  },
  {
    id: "performance_plus",
    sku: "ADD-PERF",
    slug: "performance-plus",
    name: "Performance+",
    shortDescription: "Muscle load, stress and recovery markers for people who train.",
    longDescription:
      "Creatine kinase reflects recent muscle load, cortisol your stress response, and IGF-1 relates to growth and recovery. Useful when you're training hard and want to see how your body is coping between blocks.",
    forWho: "You train most days and want to see how your body is coping and recovering.",
    markerIds: ["ck", "cortisol", "igf1"],
    priceCents: resolvePrice("performance_plus", null),
    enabled: true,
    // PROVISIONAL: depends on laboratory availability. Flip to false to withdraw
    // it from sale without touching any component.
    launchEnabled: true,
    badge: "for-performance",
    recommendedFor: ["training"],
  },
  // TODO(decision): PSA only where age / use case supports it, never by default. Not offered.
  {
    id: "psa",
    sku: "ADD-PSA",
    slug: "psa",
    name: "PSA",
    shortDescription: "Prostate-specific antigen, where appropriate.",
    longDescription: "",
    forWho: "Where age or circumstances make it appropriate.",
    markerIds: ["psa"],
    priceCents: null,
    enabled: false,
    launchEnabled: false,
    recommendedFor: [],
  },
];

export const getAddon = (id: string) => addons.find((a) => a.id === id && a.enabled);
export const isSellable = (a: Addon) => a.enabled && a.launchEnabled;
/** Enabled add-ons offered with a product, in the product's display order (includes unlaunched). */
export const addonsFor = (product: Product = signalTest): Addon[] =>
  product.addonIds.map(getAddon).filter((a): a is Addon => Boolean(a));
/** Add-ons that can be selected and priced today. */
export const sellableAddonsFor = (product: Product = signalTest): Addon[] => addonsFor(product).filter(isSellable);
/** Add-ons to render in a configurator: sellable, plus unlaunched ones as disabled cards when configured. */
export const displayableAddonsFor = (product: Product = signalTest): Addon[] =>
  addonsFor(product).filter((a) => isSellable(a) || SHOW_UNLAUNCHED_ADDONS);
/** Markers an add-on adds beyond the base panel (an add-on never re-sells a base marker). */
export const addonNewMarkers = (addon: Addon, product: Product = signalTest) =>
  addon.markerIds.filter((m) => !product.markerIds.includes(m));
export const addonNewMarkerCount = (addon: Addon, product: Product = signalTest) => addonNewMarkers(addon, product).length;
/** Sellable add-ons recommended for a set of interests, ordered by how many interests they match. */
export function recommendAddons(interestIds: InterestId[], product: Product = signalTest): Addon[] {
  const set = new Set(interestIds);
  return sellableAddonsFor(product)
    .map((a) => ({ a, hits: a.recommendedFor.filter((i) => set.has(i)).length }))
    .filter((x) => x.hits > 0)
    .sort((x, y) => y.hits - x.hits)
    .map((x) => x.a);
}
