import type { Product } from "@/config/products";
import type { RetestOffer } from "@/config/retest-offer";
import { formatAUD } from "@/lib/money";

export interface RetestQuote {
  offerId: string;
  offerVersion: number;
  discountCents: number;
  refundTodayCents: number;
  recurringPriceCents: number;
  intervalMonths: number;
}

export function isEligible(product: Product, offer: RetestOffer): boolean {
  return offer.active && (offer.appliesTo === "all" || offer.appliesTo.includes(product.id));
}

/**
 * Pure calculation shared by the UI and (in phase 2) the server action that
 * creates the Stripe subscription and refund — so the amount the customer sees
 * is exactly the amount they are charged and refunded.
 */
export function quoteRetest(priceCents: number, offer: RetestOffer): RetestQuote {
  const discountCents = Math.round((priceCents * offer.discountBps) / 10_000);
  return {
    offerId: offer.id,
    offerVersion: offer.version,
    discountCents,
    refundTodayCents: offer.refundOnConversion ? discountCents : 0,
    recurringPriceCents: priceCents - discountCents,
    intervalMonths: offer.intervalMonths,
  };
}

export const formatInterval = (months: number) =>
  months === 12 ? "year" : months === 1 ? "month" : `${months} months`;

/** Fill offer copy tokens. Requires a priced product (checkout never reaches here without one). */
export function renderOfferCopy(template: string, product: Product & { priceCents: number }, offer: RetestOffer): string {
  const q = quoteRetest(product.priceCents, offer);
  const tokens: Record<string, string> = {
    refund: formatAUD(q.refundTodayCents),
    price: formatAUD(q.recurringPriceCents),
    interval: formatInterval(q.intervalMonths),
    discount: `${offer.discountBps / 100}%`,
    product: product.name,
  };
  return template.replace(/\{(\w+)\}/g, (m, k: string) => tokens[k] ?? m);
}
