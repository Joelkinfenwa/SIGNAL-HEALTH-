import { signalTest } from "../products";
import { postPurchaseOffer, retestOffers, formatDiscount } from "../retest-offer";
import { formatAUD } from "../../lib/money";
import { quoteRetest } from "../../lib/retest/offer";
import { legalEntity as e } from "./entity";
import type { LegalDocument } from "./types";

const plans = retestOffers.filter((o) => o.active).map((o) => {
  const q = signalTest.priceCents !== null ? quoteRetest(signalTest.priceCents, o) : null;
  return `- ${o.name} (${o.cadence.toLowerCase()}): ${formatDiscount(o.discountBps)} off the SIGNAL Test and any add-ons${q ? `, currently ${formatAUD(q.recurringPriceCents)} per base test` : ""}, charged per test at the start of each ${o.intervalMonths}-month interval.`;
});
const cancellation = postPurchaseOffer.cancellationLine[postPurchaseOffer.cancellationPolicy];

/**
 * Automatic Retesting Terms. DRAFT. Mirrors the disclosure shown on the
 * post-purchase offer (config/retest-offer.ts) so the terms and the screen
 * never diverge. Review for Australian Consumer Law and unfair contract terms.
 */
export const retestingTerms: LegalDocument = {
  slug: "retesting-terms",
  title: "Automatic Retesting Terms",
  intro: `These terms apply if you choose Automatic Retesting with ${e.tradingName}. Automatic Retesting is optional, uses recurring billing, and continues until you cancel. They apply together with our Terms of Service and Privacy Policy.`,
  sections: [
    { id: "what", title: "1. What you are agreeing to", body: [
      "When you accept a retesting plan you authorise us to charge the payment method used for your first order, at the member price for your plan, at the start of each interval, for a repeat of your SIGNAL configuration, until you cancel. Each charge is for one test. Collection is booked and charged per visit at the then-current fee and is not part of the recurring amount.",
      "The plans are:",
      ...plans,
    ]},
    { id: "refund", title: "2. The refund on your first order", body: [
      "When you accept a plan on the confirmation page after your first purchase, we refund the plan's discount on the eligible lines of that order (the SIGNAL Test and any add-ons, not collection fees) to your payment method. We issue the refund immediately after your plan is set up; your bank may take 5 to 10 business days to show it.",
      cancellation,
    ]},
    { id: "schedule", title: "3. When you are charged and reminded", body: [
      `Your first recurring charge is due one interval after the date of your first order and is shown to you before you accept. We email you ${postPurchaseOffer.reminderDaysBefore} days before each charge with the date, the amount and a link to change the date, pause or cancel. If a charge fails we will tell you and retry; if it continues to fail your plan is paused and no test is ordered.`,
    ]},
    { id: "changes", title: "4. Changing, pausing and cancelling", body: [
      `You can change your next test date, pause your plan or cancel at any time by emailing ${e.supportEmail}, with no fee. A cancellation takes effect immediately and stops all future charges. A charge already taken for a test you have not yet booked is refunded in full on request if you cancel within 14 days of that charge, or you may keep the test credit and book it when you like.`,
    ]},
    { id: "price", title: "5. Price changes", body: [
      "The member price is the plan discount applied to the then-current SIGNAL Test and add-on prices. If our prices change we will tell you at least 30 days before any charge at a new amount, and you may cancel before it is taken.",
    ]},
    { id: "consent", title: "6. Your consent record", body: [
      `We record the plan, the amounts quoted and the exact wording you agreed to (version ${postPurchaseOffer.consentTextVersion}), together with the date and time. You can request a copy at any time.`,
    ]},
    { id: "law", title: "7. Consumer law", body: [
      "Nothing in these terms limits your rights under the Australian Consumer Law. Where these terms and the Terms of Service differ on Automatic Retesting, these terms apply.",
    ]},
  ],
};
