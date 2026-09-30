import type { Product } from "../../config/products";
import type { RetestOffer } from "../../config/retest-offer";
import { formatAUD } from "../money";
import type { QuoteLine } from "../pricing";

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

/**
 * Quote against a paid order: the discount applies to the lines the plan
 * covers (product, optionally add-ons; never the collection fee), the refund
 * is that discount, and the recurring price is what each future retest costs
 * before any collection fee. Same integer maths as quoteRetest().
 */
export function quoteRetestForOrder(lines: QuoteLine[], offer: RetestOffer): RetestQuote & { eligibleCents: number } {
  const eligible = lines
    .filter((l) => l.kind === "product" || (l.kind === "addon" && offer.discountAppliesToAddons) || (l.kind === "collection" && offer.discountAppliesToCollection))
    .reduce((n, l) => n + (l.priceCents ?? 0), 0);
  const q = quoteRetest(eligible, offer);
  return { ...q, eligibleCents: eligible };
}

/** Add whole months, clamping the day (31 Jan + 1 month = 28/29 Feb). */
export function addMonths(date: Date, months: number): Date {
  const d = new Date(date.getTime());
  const day = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + months);
  const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(day, last));
  return d;
}

export const formatDate = (d: Date) =>
  new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "long", year: "numeric", timeZone: "Australia/Sydney" }).format(d);

/** Fill {refund} {paid} {price} {interval} {discount} {date} {reminder} in post-purchase copy. */
export function fillOfferTokens(template: string, t: { refund: number; paid: number; price: number; intervalMonths: number; discountBps: number; nextDate: Date; reminderDays: number }): string {
  const tokens: Record<string, string> = {
    refund: formatAUD(t.refund),
    paid: formatAUD(t.paid),
    price: formatAUD(t.price),
    interval: formatInterval(t.intervalMonths),
    discount: `${t.discountBps / 100}%`,
    date: formatDate(t.nextDate),
    reminder: String(t.reminderDays),
  };
  return template.replace(/\{(\w+)\}/g, (m, k: string) => tokens[k] ?? m);
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
