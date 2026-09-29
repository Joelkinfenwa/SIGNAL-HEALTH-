
/**
 * Automatic Retesting plans.
 *
 * Customer-facing name is "Automatic Retesting" (never "subscription"), but
 * wherever billing is discussed the copy must say plainly that it is
 * recurring billing: charged per test at the chosen interval, continues until
 * cancelled, changeable or cancellable from the account.
 *
 * Nothing about a plan (discount, interval, perks, copy) is hard-coded in
 * components or payment logic — everything derives from these records.
 * In phase 2 these move to the database so they can be versioned and A/B
 * tested; the consent record always stores the exact offer id + version shown.
 *
 * Copy templates accept tokens: {refund} {price} {interval} {discount} {product}
 */
export interface RetestOffer {
  id: string;
  version: number;
  active: boolean;
  /** Short plan name for pickers and tables. */
  name: string;
  /** How often, in words. */
  cadence: string;
  /** Discount in basis points (1500 = 15%). Integer maths avoids rounding drift. */
  discountBps: number;
  intervalMonths: number;
  /** Product ids this plan applies to, or "all". */
  appliesTo: string[] | "all";
  /** Refund the discount against today's order when the customer converts. */
  refundOnConversion: boolean;
  /** Extra benefits beyond the discount. TODO-VERIFY each is operationally deliverable before launch. */
  perks: string[];
  /** Marks the plan to lead with. */
  featured: boolean;
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
    id: "retest_6m",
    version: 1,
    active: true,
    name: "Twice a year",
    cadence: "Every 6 months",
    discountBps: 1500,
    intervalMonths: 6,
    appliesTo: "all",
    refundOnConversion: true,
    perks: [],
    featured: false,
    copy: {
      headline: "Get {refund} back today.",
      body: "Retest every {interval} and save {discount} on this test and every retest.",
      acceptLabel: "Retest every 6 months",
      declineLabel: "No thanks, just this test",
    },
  },
  {
    id: "retest_3m",
    version: 1,
    active: true,
    name: "Four times a year",
    cadence: "Every 3 months",
    discountBps: 2000,
    intervalMonths: 3,
    appliesTo: "all",
    refundOnConversion: true,
    // TODO-VERIFY: priority booking and the included at-home visit must be defined operationally
    // (what "priority" means, how the included visit is redeemed, regions) before launch.
    perks: ["Priority booking", "One at-home collector visit included each year"],
    featured: true,
    copy: {
      headline: "Get {refund} back today.",
      body: "Retest every {interval}, save {discount} on every test, and get priority booking with one at-home visit included each year.",
      acceptLabel: "Retest every 3 months",
      declineLabel: "No thanks, just this test",
    },
  },
];

export const activeRetestOffers = () => retestOffers.filter((o) => o.active);
/** The default plan used wherever a single interval is illustrated (e.g. the "Your signal" card). */
export const activeRetestOffer = () => activeRetestOffers().find((o) => o.id === "retest_6m") ?? activeRetestOffers()[0] ?? null;
export const bestDiscountBps = () => Math.max(0, ...activeRetestOffers().map((o) => o.discountBps));
export const formatDiscount = (bps: number) => `${bps / 100}%`;
