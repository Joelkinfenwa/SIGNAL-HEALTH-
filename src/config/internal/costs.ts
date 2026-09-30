import "server-only";

/**
 * INTERNAL cost of goods. Server-only by construction: the `server-only`
 * import makes any client component that imports this file fail the build.
 * Never re-export these values through a client-delivered config, a page
 * prop, an API response or an analytics event.
 *
 * Amounts in cents, AUD, ex GST. `null` = not yet quoted by the laboratory.
 * TODO(pricing): fill add-on costs from the lab quote; keep the base figure current.
 */
export const internalCostCents: Readonly<Record<string, number | null>> = {
  signal: 9287, // base SIGNAL Test pathology COGS (approx.)
  hormones_plus: null,
  nutrients_plus: null,
  heart_plus: null,
  thyroid_plus: null,
  performance_plus: null,
};

export const internalCostFor = (id: string): number | null => internalCostCents[id] ?? null;

/** Gross margin in basis points for a price, or null when either side is unknown. */
export function grossMarginBps(id: string, priceCents: number | null): number | null {
  const cost = internalCostFor(id);
  if (cost === null || priceCents === null || priceCents === 0) return null;
  return Math.round(((priceCents - cost) / priceCents) * 10_000);
}
