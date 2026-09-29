import { biomarkerCategories } from "@/config/biomarkers";
import { allPanelMarkers, lowestPriceCents, products, totalCategoryCount } from "@/config/products";
import { activeRetestOffer } from "@/config/retest-offer";
import { formatAUD } from "@/lib/money";
import { formatInterval } from "@/lib/retest/offer";

/**
 * Fill {fromPrice} {areas} {markers} {tests} {interval} in marketing copy from config.
 * {fromPrice} is left untouched when no product has a price yet — pick copy with
 * `pickPriced()` so no "from $" line renders without a number.
 */
export function fillHomeTokens(template: string): string {
  const price = lowestPriceCents();
  const tokens: Record<string, string> = {
    areas: String(totalCategoryCount() || biomarkerCategories.length),
    markers: String(allPanelMarkers().length),
    tests: String(products.length),
    interval: formatInterval(activeRetestOffer()?.intervalMonths ?? 6),
  };
  if (price !== null) tokens.fromPrice = formatAUD(price);
  return template.replace(/\{(\w+)\}/g, (m, k: string) => tokens[k] ?? m);
}

/** Choose the priced or unpriced variant of a line depending on whether pricing exists. */
export function pickPriced(priced: string, unpriced: string): string {
  return fillHomeTokens(lowestPriceCents() !== null ? priced : unpriced);
}
