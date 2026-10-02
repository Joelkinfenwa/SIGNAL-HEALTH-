/**
 * Collection methods. Availability, wording and any price difference are
 * business facts: keep them here, not in components.
 * TODO-VERIFY: launch regions, mobile availability and whether mobile carries a fee.
 */
import { resolvePrice } from "./pricing";

export type CollectionMethodId = "centre" | "mobile";

export interface CollectionMethod {
  id: CollectionMethodId;
  name: string;
  short: string;
  description: string;
  /** Shown next to the option; keep honest about availability. */
  availabilityNote: string;
  /** Added to the order total. null = not yet set. 0 = included. */
  priceDeltaCents: number | null;
  status: "live" | "limited" | "planned";
}

export const collectionMethods: CollectionMethod[] = [
  {
    id: "centre",
    name: "Collection centre",
    short: "At a centre",
    description: "Drop into a collection centre at a time that suits you.",
    availabilityNote: "Locations shown when you book.",
    priceDeltaCents: 0,
    status: "live",
  },
  {
    id: "mobile",
    name: "At home or work",
    short: "At home",
    description: "A qualified collector comes to you.",
    availabilityNote: "Available in selected areas. Enter your postcode at booking to check.",
    priceDeltaCents: resolvePrice("mobile", null), // TODO(pricing): home-visit fee, or 0 if included
    status: "limited",
  },
];

export const getCollectionMethod = (id: CollectionMethodId) => collectionMethods.find((c) => c.id === id)!;
