/**
 * Funnel page: /men. Built to be read in twenty seconds on a phone, in the
 * customer's own voice: hero, the offer card, what's checked (tap to expand),
 * three steps, three "sound familiar" lines, guarantee + trust, close, five
 * collapsed FAQs. One product, one price, one button. Every word is here so
 * sections can be rewritten and tested without touching JSX.
 *
 * AHPRA / National Law s133 (advertising a regulated health service):
 *  - No testimonials or reviews about the service. This page offers doctor
 *    review, so the proof section is factual, never quotes.
 *  - No claims that create an unreasonable expectation of benefit (a panel
 *    "explains your fatigue"), no "diagnostic" wording, no encouragement of
 *    unnecessary use (retesting is framed as optional), and every discount or
 *    guarantee states its terms.
 *  - Titles must be accurate: "Australian-registered doctor" only once confirmed.
 *
 * Claims: each trust/guarantee line carries `verified`. Unverified lines
 * render on previews only (with a ? marker) and are listed in the README
 * claims register. All lines were confirmed by the Director on 2 Oct 2026;
 * set `verified: false` on any line that changes until it is re-confirmed.
 *
 * Prices are never typed here: they come from products.ts, addons.ts and
 * retest-offer.ts via the tokens {price} {addonsFrom} {track6Price}
 * {track3Price} {track6Discount} {track3Discount} {perWeek} {homeVisit}.
 */
import { sellableAddonsFor } from "../addons";
import { signalTest } from "../products";
import { retestOffers } from "../retest-offer";

export interface Claim { text: string; verified: boolean }
export const menFunnel = {
  slug: "men",
  seo: { title: "The blood test for blokes who haven't had one in years | SIGNAL", description: "{markers} markers, one visit, a doctor's plain-English explanation within 5 days. {price}, no GP referral, no lock-in." },

  // Header strip
  trustStrip: [
    { text: "Powered by Express Pathology", verified: true },
    { text: "Australian-registered doctors", verified: true },
    { text: "Accredited Australian laboratories", verified: true },
  ] as Claim[],

  // 1. Hero = the dream outcome: what life looks like after. One button.
  hero: {
    eyebrow: "For Aussie men 30–60",
    headline: "Know exactly where your body stands.",
    subheadline: ["One blood draw. {markers} markers across {buckets} areas of health, with a doctor's written explanation of every result in plain English."],
    primaryCta: { label: "Get tested – {price}", href: "/checkout" },
    trustLine: [
      { text: "No GP referral", verified: true },
      { text: "Results within 5 days", verified: true },
      { text: "Clear explanation or your fee back", verified: true },
    ] as Claim[],
  },

  // 1b. What's inside: the product laid out like contents. Buckets come from panel.buckets below.
  inside: {
    eyebrow: "What's inside",
    title: "{markers} markers. {buckets} areas. Tap any one to see every marker.",
    intro: "Not a random handful of tests. The full picture a doctor would want before saying anything about your health.",
  },

  // 1b2. Our tests: everything on sale today, as cards. Prices and markers come from products.ts and addons.ts.
  tests: {
    eyebrow: "Our tests",
    title: "One test. Five ways to go deeper.",
    intro: "Everything we offer today, all from the same blood draw. The SIGNAL Test is the base. Add-ons are optional, priced on top, and chosen at checkout.",
  },

  // 1c. What you receive: described as it is. A copy of the laboratory report and the doctor's written explanation.
  outcome: {
    eyebrow: "What you receive",
    title: "Your laboratory report, and a doctor's explanation of it.",
    intro: "Within 5 days of collection you receive a copy of your laboratory report, every marker with your result and the laboratory's reference range, together with a doctor's written explanation of what it means for you, in plain English. Yours to keep and take to your GP.",
    docs: [
      { id: "report", title: "A copy of your laboratory report", body: "Every marker, your result, the reference range, and anything the laboratory flagged." },
      { id: "note", title: "The doctor's written explanation", body: "What stands out, what's fine, and whether anything is worth following up with your GP. Written for you, not for another doctor." },
    ],
    doctorLine: { text: "Read as a whole by an Australian-registered doctor before it reaches you.", verified: true },
  },

  // 2. Likelihood of success: why this will actually work for you. Facts, no testimonials (AHPRA s133).
  proof: {
    eyebrow: "Why it works",
    title: "Built on real pathology, not a wellness app.",
    tiles: [
      { icon: "tube", title: "Accredited Australian laboratories", body: "Your blood is analysed by 4Cyte Pathology or Australian Clinical Labs, the same laboratories your GP uses.", verified: true },
      { icon: "shield", title: "Australian-registered doctors", body: "Every report is read as a whole by a registered doctor before you see it. Nothing is auto-generated.", verified: true },
      { icon: "home", title: "Powered by Express Pathology", body: "A working pathology collection business, not a start-up renting a lab. Walk in or, in selected areas, we come to you.", verified: true },
      { icon: "check", title: "Clear explanation or your fee back", body: "If the doctor's explanation isn't clear, email within 7 days of your report and we refund the {price} in full.", verified: true },
    ] as { icon: "tube" | "shield" | "home" | "check" | "calendar" | "chart"; title: string; body: string; verified: boolean }[],
  },

  // 3. Speed: how soon you have it in your hands.
  speed: {
    eyebrow: "How fast",
    title: "Booked in three minutes. Answers within 5 days.",
    steps: [
      { when: "Right now", title: "Order online", body: "Three minutes. Your pathology request form lands in your inbox straight away.", verified: true },
      { when: "When it suits you", title: "Walk in, get your blood drawn", body: "Any 4Cyte or Clinical Labs centre. No appointment, no referral.", verified: true },
      { when: "Within 5 days", title: "Your results and the doctor's explanation", body: "Every marker on its range, every flag explained, in your inbox.", verified: true },
    ] as { when: string; title: string; body: string; verified: boolean }[],
  },

  // 4. Effort and sacrifice: what it asks of you, next to what it doesn't.
  effort: {
    eyebrow: "What it takes",
    title: "Three minutes online. One blood draw. That's it.",
    yours: ["Order online in three minutes", "Walk into a collection centre with your form and photo ID", "Read your results"],
    notYours: ["No GP appointment to get a referral", "No chasing the lab for a copy", "No decoding a printout", "No lock-in, no subscription unless you want one"],
    price: { text: "One payment of {price}. Add-ons from {addonsFrom} if you want more depth.", verified: true },
  },

  // 2. The offer, at a glance. Shown on every screen size straight after the hero.
  offer: {
    title: "What you get",
    rows: [
      { text: "{markers} blood markers across {areas} areas of health", verified: true },
      { text: "Walk-in collection at 4Cyte or Clinical Labs. No appointment.", verified: true },
      { text: "Analysed by an accredited Australian laboratory", verified: true },
      { text: "A doctor's written explanation of every result, in plain English", verified: true },
      { text: "Results in your inbox within 5 days", verified: true },
    ] as Claim[],
    foot: "One payment. Add-ons from {addonsFrom}. No GP referral, no lock-in.",
  },

  // 3. What's checked: areas with marker counts, tap to see the markers. Marker names render from biomarkers.ts.
  panel: {
    title: "What's checked",
    intro: "{markers} markers. Tap an area to see them.",
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

  // 4. How it works: three steps, under ten words each
  steps: {
    title: "How it works",
    items: [
      { icon: "calendar", title: "Book online", body: "Three minutes. Your request form is emailed straight away." },
      { icon: "tube", title: "Walk in, get your blood drawn", body: "Any 4Cyte or Clinical Labs centre. No appointment." },
      { icon: "shield", title: "A doctor explains it", body: "Every result in plain English, within 5 days." },
    ] as { icon: "calendar" | "tube" | "shield" | "chart"; title: string; body: string }[],
  },

  // 5. Sound familiar: the avatar's own voice, never diagnostic
  familiar: {
    title: "Sound familiar?",
    items: [
      "You know your mortgage rate off by heart. Not your cholesterol.",
      "The car gets serviced every 10,000 km. You haven't been checked since your twenties.",
      "Flat by 3pm most days, and you've stopped mentioning it.",
    ],
    note: "SIGNAL doesn't diagnose anything. It shows you where things sit, and a doctor explains what that means.",
  },

  // 6. Guarantee and trust in one card
  safety: {
    title: "Clear explanation or your fee back.",
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

  // 7. FAQ: five questions, answers of one or two sentences, collapsed
  faq: {
    title: "Quick questions",
    items: [
      { q: "Is this covered by Medicare?", a: "No. It's a private test you order yourself, so no referral and no waiting. {price} is the full price." },
      { q: "Where do I get my blood taken?", a: "Any 4Cyte Pathology or Australian Clinical Labs centre. Walk in with your form and photo ID, or in selected areas a collector comes to you for {homeVisit}." },
      { q: "Why not just see my GP?", a: "You can, and your report is written so you can take it to them. SIGNAL covers {markers} markers in one draw with a doctor's written explanation, no referral." },
      { q: "What if a result is abnormal?", a: "Your report flags it, explains what the marker means, and says plainly if follow-up with your GP is worth it. If something needs prompt attention, we call you." },
      { q: "Will I get medication?", a: "No, and we never promise it. SIGNAL is a test and a doctor's explanation. Any treatment is only considered separately, by a doctor, if clinically appropriate." },
    ],
  },

  // 8. Close
  close: {
    headline: "Stop guessing. See where you stand.",
    sub: "{markers} markers. A doctor's plain-English explanation. {price}.",
    cta: { label: "Get tested – {price}", href: "/checkout" },
    micro: "Walk-in collection. Results within 5 days. Clear explanation or your fee back.",
    plansLink: { label: "Want to track change over time? See retesting plans", href: "/retesting" },
  },
};

/** Lowest sellable add-on price, for "from {addonsFrom}". */
export const addonsFromCents = () => Math.min(...sellableAddonsFor(signalTest).map((a) => a.priceCents ?? Infinity));
export const trackOffer = (id: "retest_6m" | "retest_3m") => retestOffers.find((o) => o.id === id && o.active) ?? null;

/** Count of lines on the page still marked unverified, for the preview banner and the claims register. */
export function unverifiedClaimCount(): number {
  const f = menFunnel;
  const all: Claim[] = [...f.trustStrip, ...f.hero.trustLine, ...f.offer.rows, ...f.safety.bullets, { text: f.safety.guarantee.body.join(" "), verified: f.safety.guarantee.verified }];
  return all.filter((c) => !c.verified).length;
}
