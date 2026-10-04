import { biomarkerCategories } from "@/config/biomarkers";
import { productCategoryCount, productMarkerCount, signalTest } from "@/config/products";
import { activeRetestOffer } from "@/config/retest-offer";
import { formatAUD } from "@/lib/money";
import { formatInterval } from "@/lib/retest/offer";

/**
 * Fill {fromPrice} {areas} {markers} {product} {interval} in marketing copy from config.
 * {fromPrice} is left untouched when no product has a price yet — pick copy with
 * `pickPriced()` so no "from $" line renders without a number.
 */
export function fillHomeTokens(template: string): string {
  const price = signalTest.priceCents;
  const tokens: Record<string, string> = {
    areas: String(productCategoryCount() || biomarkerCategories.length),
    markers: String(productMarkerCount()),
    product: signalTest.name,
    interval: formatInterval(activeRetestOffer()?.intervalMonths ?? 6),
  };
  if (price !== null) tokens.fromPrice = formatAUD(price);
  return template.replace(/\{(\w+)\}/g, (m, k: string) => tokens[k] ?? m);
}

/** Choose the priced or unpriced variant of a line depending on whether pricing exists. */
export function pickPriced(priced: string, unpriced: string): string {
  return fillHomeTokens(signalTest.priceCents !== null ? priced : unpriced);
}
