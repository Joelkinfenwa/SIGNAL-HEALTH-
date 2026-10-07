/**
 * Funnel page: /men. Built to be read in twenty seconds on a phone: hero,
 * three steps, four-line value, markers collapsed, trust + guarantee, five
 * short FAQs, close. One product, one price, one button. Every word is here
 * so sections can be rewritten and tested without touching JSX.
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
  seo: { title: "Tired, flat, or not yourself? Find out what your blood is saying | SIGNAL", description: "One comprehensive blood test, {markers} markers, reviewed by an Australian-registered doctor and explained in plain English within 5 days. {price}, no GP referral." },

  // Header strip
  trustStrip: [
    { text: "Powered by Express Pathology", verified: true },
    { text: "Australian-registered doctors", verified: true },
    { text: "Accredited Australian laboratories", verified: true },
  ] as Claim[],

  // 1. Hero: callout, value, CTA. No photo: the words are the hero. One line of sub.
  hero: {
    eyebrow: "For Australian men 30–60",
    headline: "Tired, flat, or not yourself? Find out what your blood is saying.",
    subheadline: ["{markers} markers. A doctor explains them in plain English. Results in 5 days."],
    primaryCta: { label: "Book your SIGNAL test – {price}", href: "/checkout" },
    trustLine: [
      { text: "Clear explanation or your fee back", verified: true },
      { text: "No GP referral", verified: true },
      { text: "No lock-in", verified: true },
    ] as Claim[],
    // Desktop only: the offer at a glance beside the headline. Facts, no mock results.
    card: {
      title: "The SIGNAL Test",
      rows: [
        { text: "{markers} markers across {areas} areas of health", verified: true },
        { text: "Accredited Australian laboratory", verified: true },
        { text: "Reviewed by an Australian-registered doctor", verified: true },
        { text: "Written explanation within 5 days", verified: true },
        { text: "Collection at a centre included", verified: true },
      ] as Claim[],
      foot: "Add-ons from {addonsFrom} · No GP referral",
    },
  },

  // 2. How it works: three steps, one short line each
  steps: {
    title: "How it works",
    items: [
      { icon: "calendar", title: "Book online", body: "Three minutes. Your request form is emailed straight away." },
      { icon: "tube", title: "Get your blood drawn", body: "Walk into any 4Cyte or Australian Clinical Labs centre. No appointment." },
      { icon: "shield", title: "A doctor explains it", body: "A plain-English explanation of every marker, in your inbox within 5 days." },
    ] as { icon: "calendar" | "tube" | "shield" | "chart"; title: string; body: string }[],
  },

  // 3. Value: four lines, no body copy
  included: {
    title: "What {price} gets you",
    bullets: [
      "{markers} blood markers across {areas} areas of health",
      "Accredited Australian laboratory",
      "Written explanation from an Australian-registered doctor",
      "Results within 5 days. No GP referral.",
    ],
    panelLink: "See every marker",
  },

  // 3b. Panel detail, collapsed by area. Marker names render from biomarkers.ts.
  panel: {
    title: "Every marker, by area",
    intro: "Tap an area to see what's in it. Reviewed by a doctor. Not a diagnosis.",
    buckets: [
      { id: "energy", name: "Energy and iron", explanation: "Looks at the cells that carry oxygen and the iron that makes them, the most common place to start when energy is low.", markerIds: ["fbc", "ferritin", "iron", "transferrin", "tsat"] },
      { id: "heart", name: "Heart and cholesterol", explanation: "Looks at the fats in your blood and the particles that carry them.", markerIds: ["tc", "ldl", "hdl", "tg", "non_hdl"] },
      { id: "metabolism", name: "Metabolism and blood sugar", explanation: "Looks at where your blood sugar sits today and on average over the last three months.", markerIds: ["glucose", "hba1c"] },
      { id: "thyroid", name: "Thyroid", explanation: "Looks at the signal that controls the gland setting your metabolic pace.", markerIds: ["tsh"] },
      { id: "liver-kidneys", name: "Liver and kidneys", explanation: "Looks at how your liver is working and how well your kidneys are filtering.", markerIds: ["alt", "ast", "alp", "ggt", "bilirubin", "albumin", "total_protein", "creatinine", "egfr", "urea"] },
      { id: "electrolytes", name: "Electrolytes and minerals", explanation: "Looks at the salts and minerals your fluid balance, nerves, muscles and bones depend on.", markerIds: ["sodium", "potassium", "chloride", "bicarbonate", "calcium", "magnesium", "phosphate", "uric_acid"] },
      { id: "inflammation", name: "Inflammation", explanation: "Looks at your general level of inflammation right now, which adds context to the heart and metabolic results.", markerIds: ["hscrp"] },
    ],
    addonsTitle: "Optional add-ons from {addonsFrom}, same draw",
    addonBuckets: [
      { addonId: "hormones_plus", name: "Hormones and drive", explanation: "Looks at key hormone levels that can influence energy, mood and sex drive, and the signals that regulate them." },
      { addonId: "thyroid_plus", name: "Thyroid in depth", explanation: "Looks at the hormones TSH controls, plus antibody markers that add context TSH alone can't." },
      { addonId: "heart_plus", name: "Heart in depth", explanation: "Looks at the particle-level cholesterol markers most check-ups never run, including one largely set by your genes." },
      { addonId: "nutrients_plus", name: "Key nutrients", explanation: "Looks at the three nutrients men most often supplement without knowing where they sit." },
      { addonId: "performance_plus", name: "Training and recovery", explanation: "Looks at muscle load, stress response and recovery, for men who train hard." },
    ],
  },

  // 4. Trust, limits and guarantee
  safety: {
    title: "Doctor-led. Accredited. Private.",
    bullets: [
      { text: "Accredited Australian laboratories", verified: true },
      { text: "Australian-registered doctors", verified: true },
      { text: "Report sent as a secure link, never shared with advertisers", verified: true },
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

  // 5. FAQ: five questions, answers of one or two sentences
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

  // 6. Final CTA strip
  close: {
    headline: "For men who'd rather know than wonder.",
    cta: { label: "Book your SIGNAL test – {price}", href: "/checkout" },
    micro: "Walk-in collection. Report within 5 days. Clear explanation or your fee back.",
    plansLink: { label: "Want to track change over time? See retesting plans", href: "/retesting" },
  },
};

/** Lowest sellable add-on price, for "from {addonsFrom}". */
export const addonsFromCents = () => Math.min(...sellableAddonsFor(signalTest).map((a) => a.priceCents ?? Infinity));
export const trackOffer = (id: "retest_6m" | "retest_3m") => retestOffers.find((o) => o.id === id && o.active) ?? null;

/** Count of lines on the page still marked unverified, for the preview banner and the claims register. */
export function unverifiedClaimCount(): number {
  const f = menFunnel;
  const all: Claim[] = [...f.trustStrip, ...f.hero.trustLine, ...f.hero.card.rows, ...f.safety.bullets, { text: f.safety.guarantee.body.join(" "), verified: f.safety.guarantee.verified }];
  return all.filter((c) => !c.verified).length;
}
