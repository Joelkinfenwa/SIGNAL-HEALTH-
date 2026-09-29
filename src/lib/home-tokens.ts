import { biomarkerCategories, totalMarkerCount } from "@/config/biomarkers";
import { lowestPriceCents } from "@/config/products";
import { activeRetestOffer } from "@/config/retest-offer";
import { formatAUD } from "@/lib/money";
import { formatInterval } from "@/lib/retest/offer";

/** Fill {fromPrice} {areas} {markers} {interval} in marketing copy from config. */
export function fillHomeTokens(template: string): string {
  const tokens: Record<string, string> = {
    fromPrice: formatAUD(lowestPriceCents()),
    areas: String(biomarkerCategories.length),
    markers: String(totalMarkerCount()),
    interval: formatInterval(activeRetestOffer()?.intervalMonths ?? 6),
  };
  return template.replace(/\{(\w+)\}/g, (m, k: string) => tokens[k] ?? m);
}
