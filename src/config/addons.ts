/**
 * Add-ons: optional marker bundles a customer can add to a panel, so niche or
 * expensive assays don't sit in every base panel's cost.
 *
 * An add-on applies to a product when it contributes at least one marker the
 * product doesn't already include (`addonsFor()`).
 *
 * `status`:
 *  - "planned": rendered on product pages as "coming" (no price, no booking yet).
 *  - "under-review": not rendered; pending lab pricing / clinical rationale.
 *
 * TODO(pricing): prices null until lab pricing (4Cyte / ACL) is confirmed.
 * TODO-VERIFY: availability of each assay with the laboratory partner.
 */
import type { Product } from "./products";

export interface AddOn {
  id: string;
  name: string;
  summary: string;
  markers: string[];
  priceCents: number | null;
  status: "planned" | "under-review";
}

export const addOns: AddOn[] = [
  { id: "advanced_heart", name: "Advanced Heart", summary: "The particle-level cholesterol markers.", markers: ["apob", "apoa1", "lpa"], priceCents: null, status: "planned" },
  { id: "advanced_hormones", name: "Advanced Hormones", summary: "A deeper look at your sex hormones and the signals that drive them.", markers: ["testosterone", "shbg", "free_t", "lh", "fsh", "oestradiol", "prolactin", "dheas"], priceCents: null, status: "planned" },
  { id: "thyroid_plus", name: "Thyroid+", summary: "The active thyroid hormones plus thyroid antibodies.", markers: ["ft3", "ft4", "thyroid_ab"], priceCents: null, status: "planned" },
  { id: "nutrients_plus", name: "Nutrients+", summary: "The vitamins and minerals your body relies on.", markers: ["zinc", "magnesium", "vit_d", "b12", "folate"], priceCents: null, status: "planned" },
  { id: "iron_plus", name: "Iron+", summary: "Full iron studies, including stores and transport.", markers: ["ferritin", "iron", "transferrin", "tsat"], priceCents: null, status: "planned" },
  { id: "performance_plus", name: "Performance+", summary: "Muscle load, stress and recovery markers.", markers: ["ck", "cortisol", "igf1"], priceCents: null, status: "planned" },
  // TODO(decision): PSA only where age/use case supports it, never by default.
  { id: "psa", name: "PSA", summary: "Prostate-specific antigen, where appropriate.", markers: ["psa"], priceCents: null, status: "under-review" },
];

/** Add-ons that would add at least one new marker to this product. */
export function addonsFor(product: Product): (AddOn & { newMarkers: string[] })[] {
  const have = new Set(product.markers);
  return addOns
    .filter((a) => a.status === "planned")
    .map((a) => ({ ...a, newMarkers: a.markers.filter((m) => !have.has(m)) }))
    .filter((a) => a.newMarkers.length > 0);
}
