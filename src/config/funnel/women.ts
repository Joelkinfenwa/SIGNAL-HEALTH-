/**
 * Funnel page: /women. The women's offer: the same SIGNAL Test at a lower
 * entry price, with add-ons and retesting plans carrying the margin. Built
 * to be read in twenty seconds on a phone, in the customer's own voice:
 * hero, the offer card, add what matters (upsell), what's checked, three
 * steps, three "sound familiar" lines, keep an eye on it (plans), guarantee
 * + trust, close, five collapsed FAQs. Every word is here so sections can be
 * rewritten and tested without touching JSX.
 *
 * AHPRA / National Law s133 (advertising a regulated health service):
 *  - No testimonials, no popularity claims, no "diagnostic" wording, no
 *    unreasonable expectation of benefit, retesting framed as optional, every
 *    discount and guarantee states its terms. The lower price is stated as a
 *    plain comparison with the standard price, never as time pressure.
 *
 * Claims: each line carries `verified`; unverified lines render on previews
 * only. Prices are never typed here: tokens {price} {compareAt} {addonsFrom}
 * {track6Price} {track3Price} {track6Discount} {track3Discount} {markers}
 * {areas} {homeVisit} are filled from products.ts, addons.ts, retest-offer.ts.
 */
import { sellableAddonsFor } from "../addons";
import { signalWomen } from "../products";
import { retestOffers } from "../retest-offer";
import type { Claim } from "./men";

const CHECKOUT = "/checkout?product=signal_women";

export const womenFunnel = {
  slug: "women",
  product: signalWomen,
  checkoutHref: CHECKOUT,
  seo: { title: "You look after everyone. When did you last check on you? | SIGNAL", description: "{markers} blood markers in one visit. A doctor explains every result in plain English within 5 days. {price}, normally {compareAt}. No GP referral." },

  trustStrip: [
    { text: "Powered by Express Pathology", verified: true },
    { text: "Australian-registered doctors", verified: true },
    { text: "Accredited Australian laboratories", verified: true },
  ] as Claim[],

  // 1. Hero
  hero: {
    eyebrow: "For Australian women 25–55",
    headline: "You look after everyone. When did you last check on you?",
    subheadline: ["{markers} blood markers in one visit. A doctor explains every result in plain English, within 5 days."],
    primaryCta: { label: "Get tested – {price}", href: CHECKOUT },
    priceNote: "Normally {compareAt}",
    trustLine: [
      { text: "No GP referral", verified: true },
      { text: "No appointment", verified: true },
      { text: "Clear explanation or your fee back", verified: true },
    ] as Claim[],
  },

  // 2. The offer: four tiles, a figure and a few words each. No sentences.
  offer: {
    title: "What you get",
    tiles: [
      { icon: "chart", figure: "{markers}", label: "blood markers", verified: true },
      { icon: "pin", figure: "1 visit", label: "walk in, no appointment", verified: true },
      { icon: "chat", figure: "Doctor", label: "explains every result", verified: true },
      { icon: "calendar", figure: "5 days", label: "results in your inbox", verified: true },
    ] as { icon: "chart" | "pin" | "chat" | "calendar"; figure: string; label: string; verified: boolean }[],
    foot: "No GP referral · No lock-in · Clear explanation or your fee back",
  },

  // 3. Add what matters: the upsell, same draw
  upsell: {
    title: "Add what matters to you",
    intro: "Same blood draw, same visit. Add any of these to your test.",
    addonIds: ["nutrients_plus", "thyroid_plus", "hormones_plus"],
    cta: "Add to my test",
    more: "Heart+ and Performance+ are also available at checkout.",
  },

  // 4. What's checked. Marker names render from biomarkers.ts.
  panel: {
    title: "Every test, listed",
    intro: "All {markers} markers in the base test, grouped by what they tell you. Add-ons underneath.",
    buckets: [
      { id: "energy", name: "Energy and iron", explanation: "Looks at the cells that carry oxygen and the iron that makes them, the most common place to start when energy is low.", markerIds: ["fbc", "ferritin", "iron", "transferrin", "tsat"] },
      { id: "heart", name: "Heart and cholesterol", explanation: "Looks at the fats in your blood and the particles that carry them.", markerIds: ["tc", "ldl", "hdl", "tg", "non_hdl"] },
      { id: "metabolism", name: "Metabolism and blood sugar", explanation: "Looks at where your blood sugar sits today and on average over the last three months.", markerIds: ["glucose", "hba1c"] },
      { id: "thyroid", name: "Thyroid", explanation: "Looks at the signal that controls the gland setting your metabolic pace.", markerIds: ["tsh"] },
      { id: "liver-kidneys", name: "Liver and kidneys", explanation: "Looks at how your liver is working and how well your kidneys are filtering.", markerIds: ["alt", "ast", "alp", "ggt", "bilirubin", "albumin", "total_protein", "creatinine", "egfr", "urea"] },
      { id: "electrolytes", name: "Electrolytes and minerals", explanation: "Looks at the salts and minerals your fluid balance, nerves, muscles and bones depend on.", markerIds: ["sodium", "potassium", "chloride", "bicarbonate", "calcium", "magnesium", "phosphate", "uric_acid"] },
      { id: "inflammation", name: "Inflammation", explanation: "Looks at your general level of inflammation right now, which adds context to the heart and metabolic results.", markerIds: ["hscrp"] },
    ],
    addonsTitle: "Add-ons from {addonsFrom}, same draw",
    addonBuckets: [
      { addonId: "hormones_plus", name: "Hormones and drive", explanation: "Looks at key hormone levels that can influence energy, mood and sex drive, and the signals that regulate them." },
      { addonId: "thyroid_plus", name: "Thyroid in depth", explanation: "Looks at the hormones TSH controls, plus antibody markers that add context TSH alone can't." },
      { addonId: "heart_plus", name: "Heart in depth", explanation: "Looks at the particle-level cholesterol markers most check-ups never run, including one largely set by your genes." },
      { addonId: "nutrients_plus", name: "Key nutrients", explanation: "Looks at the three nutrients men most often supplement without knowing where they sit." },
      { addonId: "performance_plus", name: "Training and recovery", explanation: "Looks at muscle load, stress response and recovery, for men who train hard." },
    ],
  },

  // 5. How it works
  steps: {
    title: "How it works",
    items: [
      { icon: "calendar", title: "Book online", body: "Three minutes. Your request form is emailed straight away." },
      { icon: "tube", title: "Walk in, get your blood drawn", body: "Any 4Cyte or Clinical Labs centre. No appointment." },
      { icon: "shield", title: "A doctor explains it", body: "Every result in plain English, within 5 days." },
    ] as { icon: "calendar" | "tube" | "shield" | "chart"; title: string; body: string }[],
  },

  // 6. Sound familiar: her own voice, never diagnostic
  familiar: {
    title: "Sound familiar?",
    items: [
      "Tired no matter how much you sleep, and everyone says it's just life.",
      "You've been meaning to get your iron checked for about two years.",
      "You know everyone else's appointments off by heart. Your own, not so much.",
    ],
    note: "SIGNAL doesn't diagnose anything. It shows you where things sit, and a doctor explains what that means.",
  },

  // 7. Keep an eye on it: optional retesting at the member price
  plans: {
    title: "Keep an eye on it",
    intro: "Optional. Retest at a member price and see what's changing. Change the date, pause or cancel any time.",
    rows: [
      { id: "one_time", name: "One test", price: "{price}", sub: "One payment. Add-ons from {addonsFrom}.", cta: "Get tested", href: CHECKOUT },
      { id: "retest_6m", name: "Twice a year", price: "{track6Price} per test", sub: "{track6Discount} off every test. Your doctor compares each result with your last.", cta: "Choose", href: `${CHECKOUT}&plan=retest_6m` },
      { id: "retest_3m", name: "Four times a year", price: "{track3Price} per test", sub: "{track3Discount} off every test. One at-home collector visit included each year, where available.", cta: "Choose", href: `${CHECKOUT}&plan=retest_3m` },
    ],
    optionalNote: "Retesting is optional. Your doctor's explanation will say whether a retest is worth doing.",
    disclosure: "Twice a year and Four times a year use recurring billing. After today's test you confirm the plan, the member discount on today's order is refunded to your card, and each future test is charged at the member price at the start of each interval until you cancel. Change the date, pause or cancel any time by emailing us.",
  },

  // 8. Guarantee and trust
  safety: {
    bullets: [
      { text: "Accredited Australian laboratories", verified: true },
      { text: "Australian-registered doctors", verified: true },
      { text: "Private. Results never shared with advertisers", verified: true },
      { text: "No medication promised. Any treatment is only ever considered separately, by a doctor", verified: true },
    ] as Claim[],
    disclaimer: "SIGNAL gives general health information from your blood results. It isn't a diagnosis and doesn't replace your GP. If a result warrants follow-up, your report says so.",
    guarantee: {
      title: "Clear explanation or your fee back.",
      body: ["If the doctor's explanation isn't clear, email us within 7 days of your report.", "We refund your {price} test fee in full."],
      terms: "This guarantee is about the clarity of the explanation. It isn't a promise about your health, your results or any treatment. One claim per order.",
      verified: true,
    },
  },

  // 9. FAQ
  faq: {
    title: "Quick questions",
    items: [
      { q: "Is this covered by Medicare?", a: "No. It's a private test you order yourself, so no referral and no waiting. {price} is the full price." },
      { q: "Does it check my iron, thyroid and hormones?", a: "Iron, thyroid (TSH), blood sugar and cholesterol are in the base test. The full thyroid panel, vitamin D, B12, folate and sex hormones are add-ons you can include in the same draw." },
      { q: "Where do I get my blood taken?", a: "Any 4Cyte Pathology or Australian Clinical Labs centre. Walk in with your form and photo ID, or in selected areas a collector comes to you for {homeVisit}." },
      { q: "What if a result is abnormal?", a: "Your report flags it, explains what the marker means, and says plainly if follow-up with your GP is worth it. If something needs prompt attention, we call you." },
      { q: "Can I do this if I'm pregnant?", a: "SIGNAL isn't designed for pregnancy care, so please talk to your GP or midwife first. They can order the tests that are right for you." },
    ],
  },

  // 10. Close
  close: {
    headline: "Check on you. Finally.",
    sub: "{markers} markers. A doctor's plain-English explanation. {price}, normally {compareAt}.",
    cta: { label: "Get tested – {price}", href: CHECKOUT },
    micro: "Walk-in collection. Results within 5 days. Clear explanation or your fee back.",
  },
};

/** Lowest sellable add-on price for this offer, for "from {addonsFrom}". */
export const womenAddonsFromCents = () => Math.min(...sellableAddonsFor(signalWomen).map((a) => a.priceCents ?? Infinity));
export const womenTrackOffer = (id: "retest_6m" | "retest_3m") => retestOffers.find((o) => o.id === id && o.active && signalWomen.retestOfferIds.includes(o.id)) ?? null;

/** Count of lines still marked unverified, for the preview banner and the claims register. */
export function womenUnverifiedClaimCount(): number {
  const f = womenFunnel;
  const all: Claim[] = [...f.trustStrip, ...f.hero.trustLine, ...f.offer.tiles.map((t) => ({ text: `${t.figure} ${t.label}`, verified: t.verified })), ...f.safety.bullets, { text: f.safety.guarantee.body.join(" "), verified: f.safety.guarantee.verified }];
  return all.filter((c) => !c.verified).length;
}
