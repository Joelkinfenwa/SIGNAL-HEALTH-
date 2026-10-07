/**
 * Funnel page: /men. Callout + value + CTA hero, then how it works, value
 * stack, why men book, trust, guarantee, optional plans, FAQ, final CTA.
 * One product, one price, one button. Every word is here so sections can be
 * rewritten and tested without touching JSX.
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
export interface PlanCard {
  id: "one_time" | "retest_6m" | "retest_3m";
  name: string;
  badge?: string;
  priceLine: string;
  priceSub?: string;
  tagline: string;
  bullets: Claim[];
  cta: { label: string; href: string };
}

export const menFunnel = {
  slug: "men",
  seo: { title: "Tired, flat, or not yourself? Find out what your blood is saying | SIGNAL", description: "One comprehensive blood test, {markers} markers, reviewed by an Australian-registered doctor and explained in plain English within 5 days. {price}, no GP referral." },

  // Header strip
  trustStrip: [
    { text: "Powered by Express Pathology", verified: true },
    { text: "Australian-registered doctors", verified: true },
    { text: "Accredited Australian laboratories", verified: true },
  ] as Claim[],

  // 1. Hero: callout, value, CTA. No photo: the words are the hero.
  hero: {
    eyebrow: "For Australian men 30–60",
    headline: "Tired, flat, or not yourself? Find out what your blood is saying.",
    subheadline: ["One comprehensive blood test.", "{markers} markers, reviewed by an Australian-registered doctor.", "Explained in plain English, within 5 days."],
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

  // 2. How it works
  steps: {
    title: "How SIGNAL works",
    intro: "Three steps. No waiting room.",
    items: [
      { icon: "calendar", title: "Book online", body: "About 3 minutes. Your pathology request form is emailed straight away." },
      { icon: "tube", title: "Get your blood drawn", body: "Walk into any 4Cyte or Australian Clinical Labs centre with your form and photo ID. No appointment." },
      { icon: "shield", title: "A doctor explains your results", body: "An Australian-registered doctor reviews the full picture and writes a plain-English explanation. In your inbox within 5 days." },
    ] as { icon: "calendar" | "tube" | "shield" | "chart"; title: string; body: string }[],
  },

  // 3. Value stack
  included: {
    title: "What {price} gets you",
    bullets: [
      { title: "{markers} blood markers across {areas} areas", body: "Energy and iron, heart and cholesterol, blood sugar, thyroid, liver, kidneys, electrolytes, minerals, inflammation, blood count." },
      { title: "Accredited Australian laboratory", body: "The same labs your GP uses." },
      { title: "An Australian-registered doctor reads it all together", body: "Patterns across markers, not just whether each number sits in range." },
      { title: "A written explanation you can actually understand", body: "What's in range, what isn't, what each marker means for you. Yours to keep and take to your GP." },
      { title: "Your results within 5 days of collection", body: "Emailed as a secure link the moment the doctor's review is done." },
      { title: "Go deeper in the same draw", body: "Hormones+, Thyroid+, Heart+, Nutrients+ from {addonsFrom}. One needle." },
    ],
    compare: "Do it through a GP and it's two appointments, a referral, and a results printout with no explanation. SIGNAL is one visit and a doctor's written read, for less than {perWeek} a week over a year.",
    panelLink: "See every marker",
  },

  // 2b. Panel detail: plain-English buckets over the real marker config. Marker names render from biomarkers.ts.
  panel: {
    title: "See what's included in the panel",
    intro: "Every result is explained in plain English and reviewed by a doctor. The panel measures where things sit and helps identify patterns that may need further follow-up. It doesn't diagnose conditions on its own.",
    buckets: [
      { id: "energy", name: "Energy and iron", explanation: "Looks at the cells that carry oxygen and the iron that makes them, the most common place to start when energy is low.", markerIds: ["fbc", "ferritin", "iron", "transferrin", "tsat"] },
      { id: "heart", name: "Heart and cholesterol", explanation: "Looks at the fats in your blood and the particles that carry them.", markerIds: ["tc", "ldl", "hdl", "tg", "non_hdl"] },
      { id: "metabolism", name: "Metabolism and blood sugar", explanation: "Looks at where your blood sugar sits today and on average over the last three months.", markerIds: ["glucose", "hba1c"] },
      { id: "thyroid", name: "Thyroid", explanation: "Looks at the signal that controls the gland setting your metabolic pace.", markerIds: ["tsh"] },
      { id: "liver-kidneys", name: "Liver and kidneys", explanation: "Looks at how your liver is working and how well your kidneys are filtering.", markerIds: ["alt", "ast", "alp", "ggt", "bilirubin", "albumin", "total_protein", "creatinine", "egfr", "urea"] },
      { id: "electrolytes", name: "Electrolytes and minerals", explanation: "Looks at the salts and minerals your fluid balance, nerves, muscles and bones depend on.", markerIds: ["sodium", "potassium", "chloride", "bicarbonate", "calcium", "magnesium", "phosphate", "uric_acid"] },
      { id: "inflammation", name: "Inflammation", explanation: "Looks at your general level of inflammation right now, which adds context to the heart and metabolic results.", markerIds: ["hscrp"] },
    ],
    addonsTitle: "Add more depth in the same draw",
    addonBuckets: [
      { addonId: "hormones_plus", name: "Hormones and drive", explanation: "Looks at key hormone levels that can influence energy, mood and sex drive, and the signals that regulate them." },
      { addonId: "thyroid_plus", name: "Thyroid in depth", explanation: "Looks at the hormones TSH controls, plus antibody markers that add context TSH alone can't." },
      { addonId: "heart_plus", name: "Heart in depth", explanation: "Looks at the particle-level cholesterol markers most check-ups never run, including one largely set by your genes." },
      { addonId: "nutrients_plus", name: "Key nutrients", explanation: "Looks at the three nutrients men most often supplement without knowing where they sit." },
      { addonId: "performance_plus", name: "Training and recovery", explanation: "Looks at muscle load, stress response and recovery, for men who train hard." },
    ],
  },

  // 4. Why men book: everyday situations, never diagnostic
  familiar: {
    title: "Sound familiar?",
    items: [
      "Flat by 3pm, most days.",
      "Training hard, not getting the results you used to.",
      "Haven't had a proper blood test since your twenties.",
      "Know your mortgage rate off by heart. Never checked your ferritin.",
      "Partner's been saying \"just go and get checked\" for a year.",
      "Would rather know than keep wondering.",
    ],
    note: "SIGNAL doesn't diagnose anything. It shows you where things sit, and a doctor explains what that means.",
  },

  // 5. Trust and safety
  safety: {
    title: "Doctor-led. Properly accredited. Private.",
    intro: "Your sample is collected by a qualified collector and analysed by an accredited Australian pathology laboratory. Every result is reviewed by an Australian-registered doctor before you see it.",
    bullets: [
      { text: "Accredited Australian laboratories", verified: true },
      { text: "Australian-registered doctors", verified: true },
      { text: "Written report sent as a secure link, stored to the same standards as hospital records", verified: true },
      { text: "Your results are never shared with advertisers", verified: true },
      { text: "We never promise medication. Any treatment is only ever considered separately, by a doctor, and only if clinically appropriate", verified: true },
    ] as Claim[],
    disclaimer: {
      title: "Medical information and limits",
      body: [
        "SIGNAL provides general health information based on your blood results. It is not a diagnosis or a full medical assessment, and it does not replace your GP.",
        "Results outside the expected range may warrant follow-up with your GP or a specialist, and your report will say so.",
        "Any treatment, including any medication, is only ever considered separately, by a doctor, and only if it is clinically appropriate for you.",
      ],
    },
    guarantee: {
      title: "Clear explanation or your fee back.",
      body: ["Get your blood drawn. Read the doctor's explanation.", "If it isn't clear, email us within 7 days of your report.", "We refund your {price} test fee. In full. No argument."],
      terms: "This guarantee is about the clarity of the explanation. It isn't a promise about your health, your results or any treatment. One claim per order.",
      verified: true,
    },
  },

  // 6. Pricing and options
  plans: {
    title: "Want to track change over time?",
    intro: "Optional. Every plan includes the full panel, the doctor's review and the written explanation. You pay per test. No lock-ins.",
    cards: [
      {
        id: "one_time",
        name: "One-time SIGNAL Panel",
        priceLine: "{price}",
        priceSub: "one payment",
        tagline: "Ideal if you've never had a proper check.",
        bullets: [
          { text: "Full panel, doctor review and written explanation", verified: true },
          { text: "Collection at a centre included", verified: true },
          { text: "Add-ons from {addonsFrom}", verified: true },
        ],
        cta: { label: "Get started", href: "/checkout" },
      },
      {
        id: "retest_6m",
        name: "SIGNAL Track",
        badge: "Save {track6Discount} per test", // factual; never a popularity claim without data (ACL / AHPRA)
        priceLine: "{track6Price} per test",
        priceSub: "2 tests a year · {track6Discount} off · charged per test",
        tagline: "Best if you want to see what's changing, not just where you are today.",
        bullets: [
          { text: "Two panels a year at the member price", verified: true },
          { text: "Your doctor's review compares each result with your last", verified: true },
          { text: "A reminder before each test, so nothing slips", verified: true },
          { text: "Change the date, pause or cancel any time", verified: true },
        ],
        cta: { label: "Get started", href: "/checkout?plan=retest_6m" },
      },
      {
        id: "retest_3m",
        name: "SIGNAL Track+",
        badge: "Save {track3Discount} per test",
        priceLine: "{track3Price} per test",
        priceSub: "4 tests a year · {track3Discount} off · charged per test",
        tagline: "For high performers and anyone whose doctor wants closer tracking.",
        bullets: [
          { text: "Four panels a year at the lowest per-test price", verified: true },
          { text: "Your doctor's review compares each result with your last", verified: true },
          { text: "One at-home collector visit included each year, where available", verified: true },
          { text: "Change the date, pause or cancel any time", verified: true },
        ],
        cta: { label: "Get started", href: "/checkout?plan=retest_3m" },
      },
    ] as PlanCard[],
    compare: {
      rows: [
        { label: "Panel + doctor review + written explanation", values: ["Included", "Included", "Included"] },
        { label: "Charged per test, no lock-in", values: ["✓", "✓", "✓"] },
        { label: "Tests per year", values: ["1", "2", "4"] },
        { label: "Per-test price", values: ["{price}", "{track6Price}", "{track3Price}"] },
        { label: "See what's changing over time", values: ["–", "✓", "✓"] },
      ],
    },
    optionalNote: "Retesting is optional. Choose a rhythm only if tracking change over time is useful for you. Your doctor's review will say whether a retest is worth doing.",
    disclosure: "SIGNAL Track and Track+ use recurring billing. After today's test you confirm the plan, the member discount on today's order is refunded to your card, and each future test is charged at the member price at the start of each interval until you cancel. Change the date, pause or cancel any time by emailing us.",
  },

  // 8. FAQ: reassure and set expectations
  faq: {
    title: "Questions men ask before booking",
    items: [
      { q: "Is this covered by Medicare?", a: "No. SIGNAL is a private test you order yourself, so there's no referral and no waiting. It isn't billed to Medicare and most health funds don't cover it. {price} is the full price." },
      { q: "Will I definitely get medication?", a: "No, and we never promise it. SIGNAL is a test and a doctor's explanation. Any treatment is only considered separately, by a doctor, and only if it's clinically appropriate for you." },
      { q: "Why not just see my GP?", a: "You can, and your SIGNAL report is written so you can take it to them. Most GP blood tests cover a handful of markers and you get numbers, not an explanation. SIGNAL covers {markers} markers in one draw, with a doctor's written read of all of them, and no referral." },
      { q: "What if my results are abnormal?", a: "Your report flags anything outside the expected range and explains what that marker means. Where follow-up with your GP or a specialist is warranted, it says so plainly. If something needs prompt attention, we call you." },
      { q: "What if my results are all normal?", a: "That's a real answer. You know where you stand, you stop wondering, and you have a baseline to compare against next time." },
      { q: "Where do I get my blood taken?", a: "Any 4Cyte Pathology or Australian Clinical Labs collection centre. Walk in with your form and photo ID. In selected areas a collector can come to you for {homeVisit}." },
    ],
  },

  // 9. Final CTA strip
  close: {
    headline: "For men who'd rather know than wonder.",
    sub: "One blood test. {markers} markers. A doctor's plain-English explanation.",
    cta: { label: "Book your SIGNAL test – {price}", href: "/checkout" },
    micro: "Walk-in collection. Report within 5 days. Clear explanation or your fee back.",
  },
};

/** Lowest sellable add-on price, for "from {addonsFrom}". */
export const addonsFromCents = () => Math.min(...sellableAddonsFor(signalTest).map((a) => a.priceCents ?? Infinity));
export const trackOffer = (id: "retest_6m" | "retest_3m") => retestOffers.find((o) => o.id === id && o.active) ?? null;

/** Count of lines on the page still marked unverified, for the preview banner and the claims register. */
export function unverifiedClaimCount(): number {
  const f = menFunnel;
  const all: Claim[] = [...f.trustStrip, ...f.hero.trustLine, ...f.hero.card.rows, ...f.safety.bullets, { text: f.safety.guarantee.body.join(" "), verified: f.safety.guarantee.verified }, ...f.plans.cards.flatMap((c) => c.bullets)];
  return all.filter((c) => !c.verified).length;
}
