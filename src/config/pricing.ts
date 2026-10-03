/**
 * Price resolution. Real prices live on the product, add-on and collection
 * records (null until set). Preview pricing lets payments be exercised in
 * Stripe test mode before pricing is locked: placeholder amounts apply only
 * when NEXT_PUBLIC_PREVIEW_PRICING=1, which must be set on the Vercel
 * Preview environment only, never Production. The server refuses to create
 * an order with preview pricing on a production deployment.
 */
export const PREVIEW_PRICING = process.env.NEXT_PUBLIC_PREVIEW_PRICING === "1";

/** TODO(pricing): placeholders for testing only. Not real prices. */
export const previewPriceCents: Readonly<Record<string, number>> = {
  // Nothing left to placeholder: every price is set. Add an id here only for a new unpriced line.
};

export function resolvePrice(id: string, real: number | null): number | null {
  if (real !== null) return real;
  return PREVIEW_PRICING ? (previewPriceCents[id] ?? null) : null;
}
