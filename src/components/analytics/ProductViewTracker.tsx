"use client";

import { useEffect } from "react";
import type { ProductTier } from "@/config/products";
import { track } from "@/lib/analytics/track";
import { centsToDollars } from "@/lib/money";

/** Emits product_viewed once per product page mount. Ad platforms only ever receive value/currency. */
export function ProductViewTracker({ productId, tier, priceCents }: { productId: string; tier: ProductTier; priceCents: number | null }) {
  useEffect(() => {
    track({
      name: "product_viewed",
      props: { product_id: productId, tier, ...(priceCents !== null ? { value: centsToDollars(priceCents), currency: "AUD" } : {}) },
    });
  }, [productId, tier, priceCents]);
  return null;
}
