
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
  /** Which lines of today's order the discount (and refund) apply to. Collection fees are per visit, not discounted. */
  discountAppliesToAddons: boolean;
  discountAppliesToCollection: boolean;
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
    discountAppliesToAddons: true,
    discountAppliesToCollection: false,
    perks: [],
    featured: false,
    copy: {
      headline: "Get {refund} back today.",
      body: "Retest every {interval} and save {discount} on this test and every retest.",
      acceptLabel: "Refund me {refund} and retest every {interval}",
      declineLabel: "No thanks, keep my one-off test",
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
    discountAppliesToAddons: true,
    discountAppliesToCollection: false,
    // TODO-VERIFY: priority booking and the included at-home visit must be defined operationally
    // (what "priority" means, how the included visit is redeemed, regions) before launch.
    perks: ["Priority booking", "One at-home collector visit included each year"],
    featured: true,
    copy: {
      headline: "Get {refund} back today.",
      body: "Retest every {interval}, save {discount} on every test, and get priority booking with one at-home visit included each year.",
      acceptLabel: "Refund me {refund} and retest every {interval}",
      declineLabel: "No thanks, keep my one-off test",
    },
  },
];

export const activeRetestOffers = () => retestOffers.filter((o) => o.active);
/** The default plan used wherever a single interval is illustrated (e.g. the "Your signal" card). */
export const activeRetestOffer = () => activeRetestOffers().find((o) => o.id === "retest_6m") ?? activeRetestOffers()[0] ?? null;
export const bestDiscountBps = () => Math.max(0, ...activeRetestOffers().map((o) => o.discountBps));
export const formatDiscount = (bps: number) => `${bps / 100}%`;

/**
 * Post-purchase offer page (/order/[orderId]). The mechanic: the customer has
 * just paid full price; choosing a plan refunds the plan's discount on today's
 * order to their card immediately, and every future retest is charged at the
 * discounted price. Copy tokens: {refund} {paid} {price} {interval} {discount} {date}.
 *
 * DECISIONS to confirm before launch (see README claims register):
 *  - windowHours: how long after payment the refund offer stays open. The page,
 *    the email and the server all read this one number.
 *  - cancellationPolicy: what happens to today's refund if they cancel before
 *    the first retest. "keep_refund" is simplest and needs no clawback logic;
 *    "reverse_refund" requires the terms and a charge mechanism. TODO(legal).
 *  - reminderDaysBefore: how far ahead the pre-charge email goes. TODO(ops).
 */
export type CancellationPolicy = "keep_refund" | "reverse_refund";

export const postPurchaseOffer = {
  windowHours: 48,
  cancellationPolicy: "keep_refund" as CancellationPolicy,
  reminderDaysBefore: 14,
  /** Consent wording version. Bump when any disclosure line changes; the consent record stores it. */
  consentTextVersion: "retest-consent-v1",
  eyebrow: "Available until {deadline}",
  expired: { headline: "This offer has ended.", body: "You can still set up Automatic Retesting later from your account; the refund on this order was available for {hours} hours after payment." },
  headline: "Get {refund} back right now.",
  body: "You paid {paid} today. Set up Automatic Retesting and we refund {refund} to your card immediately, then every retest is {discount} off.",
  planRefundLabel: "Refund today",
  planThenLabel: "Then {price} per test, every {interval}",
  disclosureTitle: "What you're agreeing to",
  disclosure: [
    "This is recurring billing. Your next SIGNAL is charged to the card you paid with at {price}, on or around {date}, then every {interval} until you cancel.",
    "We email you {reminder} days before each charge with the date, the amount and a link to change or cancel it.",
    "Change the date, pause or cancel any time from your account. No fees.",
    "Collection is booked and charged per visit, the same as today, so it isn't included in the retest price.",
  ],
  cancellationLine: {
    keep_refund: "If you cancel before your next test, you keep today's refund and you simply aren't charged again.",
    reverse_refund: "If you cancel before your next test, today's refund is reversed and charged back to your card.",
  } as Record<CancellationPolicy, string>,
  refundTiming: "We issue the refund straight away. Your bank usually shows it within 5 to 10 business days.",
  consentLabel: "I understand this is recurring billing at {price} every {interval} until I cancel, and I agree to the Retesting terms.",
  accepted: {
    headline: "Done. {refund} is on its way back to your card.",
    body: "Your next SIGNAL is booked for around {date} at {price}. We'll remind you before it's charged. Change it any time from your account.",
  },
  declined: {
    headline: "No problem.",
    body: "You've paid for one SIGNAL Test. You can set up Automatic Retesting later from your account, though today's refund is only available on this page.",
  },
};
