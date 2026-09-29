import type { ProductTier } from "./products";

/**
 * Automatic Retesting offer configuration.
 *
 * Nothing about the offer (discount, interval, eligibility, copy) is hard-coded
 * in components or payment logic — everything derives from an offer record.
 * In phase 2 these records move to the database so they can be versioned and
 * A/B tested; the consent record always stores the exact offer id + version shown.
 *
 * Copy templates accept tokens: {refund} {price} {interval} {discount} {product}
 */
export interface RetestOffer {
  id: string;
  version: number;
  active: boolean;
  /** Discount in basis points (1500 = 15%). Integer maths avoids rounding drift. */
  discountBps: number;
  intervalMonths: number;
  eligibleTiers: ProductTier[] | "all";
  /** Refund the discount against today's order when the customer converts. */
  refundOnConversion: boolean;
  experimentKey?: string;
  copy: {
    headline: string;
    body: string;
    acceptLabel: string;
    declineLabel: string;
  };
}

export const retestOffers: RetestOffer[] = [
  {
    id: "retest_default",
    version: 1,
    active: true,
    discountBps: 1500,
    intervalMonths: 6,
    eligibleTiers: "all",
    refundOnConversion: true,
    copy: {
      headline: "Get {refund} back today.",
      body: "Switch to Automatic Retesting every {interval} and save {discount} on this test and every retest.",
      acceptLabel: "Switch to Automatic Retesting",
      declineLabel: "No thanks, just this test",
    },
  },
];

export const activeRetestOffer = () => retestOffers.find((o) => o.active) ?? null;
