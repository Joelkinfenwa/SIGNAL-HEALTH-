/**
 * Add-ons: optional depth on top of THE SIGNAL TEST.
 *
 * SIGNAL = breadth; add-ons = depth. The base test must feel complete on its
 * own; add-ons are extra depth, never essentials held back.
 *
 * `status`: "live" sells; "planned" renders as coming (no price, not
 * selectable); "under-review" is never rendered.
 *
 * PROVISIONAL marker lists per the brief. TODO-VERIFY assay availability
 * with the laboratory partner. TODO(pricing): prices null until set.
 */
import type { InterestId } from "./interests";
import { signalTest, type Product } from "./products";

export interface Addon {
  id: string;
  sku: string;
  name: string;
  /** One line, benefit first. */
  benefit: string;
  markerIds: string[];
  /** Markers being considered for this add-on; not rendered. */
  underConsideration?: string[];
  priceCents: number | null;
  status: "live" | "planned" | "under-review";
  recommendedFor: InterestId[];
}

export const addons: Addon[] = [
  {
    id: "hormones_plus",
    sku: "ADD-HORM",
    name: "Hormones+",
    benefit: "The signals behind your hormones, not just the headline number.",
    markerIds: ["lh", "fsh", "oestradiol", "prolactin", "dheas"],
    underConsideration: ["cortisol"],
    priceCents: null,
    status: "planned",
    recommendedFor: ["hormones", "energy"],
  },
  {
    id: "heart_plus",
    sku: "ADD-HEART",
    name: "Heart+",
    benefit: "The particle-level cholesterol markers most check-ups never run.",
    markerIds: ["apob", "apoa1", "lpa", "apob_apoa1"],
    priceCents: null,
    status: "planned",
    recommendedFor: ["heart", "ageing"],
  },
  {
    id: "thyroid_plus",
    sku: "ADD-THY",
    name: "Thyroid+",
    benefit: "The active thyroid hormones and antibodies, beyond TSH.",
    markerIds: ["ft4", "ft3", "tpo_ab", "tg_ab"],
    priceCents: null,
    status: "planned",
    recommendedFor: ["thyroid", "energy"],
  },
  {
    id: "performance_plus",
    sku: "ADD-PERF",
    name: "Performance+",
    benefit: "Muscle load, stress and recovery markers for people who train.",
    markerIds: ["ck", "cortisol", "igf1"],
    priceCents: null,
    status: "planned",
    recommendedFor: ["training"],
  },
  {
    id: "metabolic_plus",
    sku: "ADD-META",
    name: "Metabolic+",
    benefit: "Fasting insulin and how your body responds to it.",
    markerIds: ["insulin", "homa_ir"],
    priceCents: null,
    status: "planned",
    recommendedFor: ["metabolic", "ageing"],
  },
  {
    id: "nutrients_plus",
    sku: "ADD-NUTR",
    name: "Nutrients+",
    benefit: "Additional micronutrients beyond the base panel.",
    markerIds: ["zinc"],
    priceCents: null,
    status: "planned",
    recommendedFor: ["nutrition", "energy"],
  },
  // TODO(decision): PSA only where age / use case supports it, never by default.
  { id: "psa", sku: "ADD-PSA", name: "PSA", benefit: "Prostate-specific antigen, where appropriate.", markerIds: ["psa"], priceCents: null, status: "under-review", recommendedFor: [] },
];

export const getAddon = (id: string) => addons.find((a) => a.id === id);
/** Add-ons offered with a product, in the product's order, excluding under-review. */
export const addonsFor = (product: Product = signalTest): Addon[] =>
  product.addonIds.map(getAddon).filter((a): a is Addon => Boolean(a) && a!.status !== "under-review");
/** Markers an add-on adds beyond the base panel (an add-on never re-sells a base marker). */
export const addonNewMarkers = (addon: Addon, product: Product = signalTest) =>
  addon.markerIds.filter((m) => !product.markerIds.includes(m));
/** Add-ons recommended for a set of interests, ordered by how many interests they match. */
export function recommendAddons(interestIds: InterestId[], product: Product = signalTest): Addon[] {
  const set = new Set(interestIds);
  return addonsFor(product)
    .map((a) => ({ a, hits: a.recommendedFor.filter((i) => set.has(i)).length }))
    .filter((x) => x.hits > 0)
    .sort((x, y) => y.hits - x.hits)
    .map((x) => x.a);
}
