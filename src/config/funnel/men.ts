/**
 * Funnel page: /men. Direct-response structure (hook → stack → steps → fit →
 * trust facts → offer → risk reversal → FAQ → close). Every word on the page
 * is here so sections can be rewritten and tested without touching JSX.
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
 * {track3Price} {track6Discount} {track3Discount}.
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
  seo: { title: "A doctor-reviewed blood panel that explains your fatigue, mood and energy | SIGNAL", description: "One visit, one comprehensive panel, reviewed by an Australian-registered doctor with a plain-English plan. {price}, no GP referral." },

  // 1. Above the fold
  trustStrip: [
    { text: "Powered by Express Pathology", verified: true },
    { text: "Australian-registered doctors", verified: true },
    { text: "Accredited Australian laboratories", verified: true },
  ] as Claim[],
  hero: {
    eyebrow: "For Australian men 30–60",
    headline: "Tired, flat or not yourself? Start with the numbers.",
    subheadline: "A comprehensive men's health blood panel, reviewed by an Australian-registered doctor, with a plain-English report and plan in around 7 days. One visit. No GP referral.",
    supporting: "{markers} markers across {buckets} key areas of men's health. Add hormones, thyroid or heart depth in the same blood draw.",
    primaryCta: { label: "Order your SIGNAL test – {price}", href: "/checkout" },
    secondaryCta: { label: "Or see what's included first", href: "#panel" },
    miniTrust: [
      { text: "No GP referral needed", verified: true },
      { text: "Results and doctor review in around 7 days", verified: true },
      { text: "Clear-plan-or-it's-free guarantee", verified: true },
    ] as Claim[],
  },

  // 2. What you get
  included: {
    title: "What you actually get when you order SIGNAL",
    intro: "When you order a SIGNAL test, you're not just getting numbers. You're getting a full check, a doctor's eyes on your results, and a written plan.",
    bullets: [
      { title: "One comprehensive blood panel", body: "{markers} markers across {buckets} key areas: energy and iron, heart and cholesterol, metabolism and blood sugar, thyroid, liver and kidneys, electrolytes and minerals, and inflammation. Every marker is listed before you pay." },
      { title: "Doctor-reviewed results", body: "An Australian-registered doctor reads your results as a whole, looking at patterns across markers, not just whether each number sits inside a range." },
      { title: "A clear, written plan", body: "What's in the expected range, what isn't, and what to do next, in plain English. If something needs follow-up with your GP or a specialist, the plan says so." },
      { title: "Optional add-ons in the same blood draw", body: "Go deeper on hormones and drive, thyroid, heart and cholesterol, key nutrients, or training and recovery. One needle, no second visit, from {addonsFrom}." },
    ],
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

  // 3. How it works
  steps: {
    title: "How SIGNAL works, start to finish",
    items: [
      { icon: "calendar", title: "Order online in 3 minutes", body: "Pay securely and choose your preferred collection location." },
      { icon: "tube", title: "Get your blood drawn", body: "At a partner collection centre or by a mobile nurse where available. No GP referral." },
      { icon: "shield", title: "A doctor reviews your results", body: "Checking for red flags and patterns, not just individual numbers." },
      { icon: "chart", title: "Get your report and plan", body: "Your results and next-step plan delivered in around 7 days." },
    ] as { icon: "calendar" | "tube" | "shield" | "chart"; title: string; body: string }[],
  },

  // 4. Who it's for
  fit: {
    title: "Who SIGNAL is (and isn't) for",
    bestForTitle: "Best for",
    bestFor: [
      "Men 30–60 feeling tired, flat, low drive or “not myself”",
      "Men who want clear numbers and a doctor's view, not guesswork from social media",
      "Men happy to pay privately for clarity and a plan",
    ],
    notForTitle: "Not for",
    notFor: [
      "Wanting specific medications guaranteed",
      "Wanting a free GP-style check-up billed to Medicare",
      "Unwilling to act on results",
    ],
  },

  // 5. Trust facts (AHPRA: no testimonials for a doctor-reviewed service)
  proof: {
    title: "Straight answers, no hype",
    intro: "We don't publish patient testimonials for a doctor-reviewed service, and Australian law agrees. Here's what we can tell you instead.",
    facts: [
      { text: "Samples are analysed by accredited Australian pathology laboratories", verified: true },
      { text: "Every result is reviewed by an Australian-registered doctor before you see it", verified: true },
      { text: "{markers} markers across {areas} areas in the base test, every one listed before you pay", verified: true },
      { text: "One clear price. No referral, no Medicare paperwork, no surprise fees", verified: true },
      { text: "Your results are never shared with advertising platforms", verified: true },
      { text: "A written refund guarantee, with the terms in plain sight", verified: true },
    ] as Claim[],
    cta: { label: "Order your SIGNAL test – {price}", href: "/checkout" },
  },

  // 6. Pricing and options
  plans: {
    title: "Choose how you want to track your health",
    cards: [
      {
        id: "one_time",
        name: "One-time SIGNAL Panel",
        priceLine: "{price}",
        priceSub: "one payment",
        tagline: "Ideal if you've never had a proper check.",
        bullets: [
          { text: "Full SIGNAL panel, doctor review and written plan", verified: true },
          { text: "Add-ons from {addonsFrom}", verified: true },
          { text: "Collection at a centre included", verified: true },
        ],
        cta: { label: "Get started", href: "/checkout" },
      },
      {
        id: "retest_6m",
        name: "SIGNAL Track",
        badge: "Save {track6Discount} per test", // factual; never a popularity claim without data (ACL / AHPRA)
        priceLine: "{track6Price} per test",
        priceSub: "2 tests a year · {track6Discount} off · charged per test",
        tagline: "Best if you want to keep an eye on things over time.",
        bullets: [
          { text: "Two panels a year at member pricing", verified: true },
          { text: "Priority doctor review", verified: true },
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
        tagline: "Best for high performers or complex cases.",
        bullets: [
          { text: "Four panels a year at the lowest per-test price", verified: true },
          { text: "Priority booking", verified: true },
          { text: "One at-home collector visit included each year", verified: true },
          { text: "Change the date, pause or cancel any time", verified: true },
        ],
        cta: { label: "Get started", href: "/checkout?plan=retest_3m" },
      },
    ] as PlanCard[],
    compare: {
      rows: [
        { label: "Panel + doctor review + written plan", values: ["Included", "Included", "Included"] },
        { label: "Tests per year", values: ["1", "2", "4"] },
        { label: "Per-test price", values: ["{price}", "{track6Price}", "{track3Price}"] },
        { label: "See what's changing over time", values: ["–", "✓", "✓"] },
      ],
    },
    optionalNote: "Retesting is optional. Choose a rhythm only if tracking change over time is useful for you; your doctor's review will say whether a retest is worth doing.",
    disclosure: "SIGNAL Track and Track+ use recurring billing: after today's test you confirm the plan, the member discount on today's order is refunded to your card, and each future test is charged at the member price at the start of each interval until you cancel. Change the date, pause or cancel any time from your account.",
  },

  // 7. Safety and guarantee
  safety: {
    title: "Safe and doctor-led",
    bullets: [
      { text: "Tests processed by accredited Australian labs", verified: true },
      { text: "Results reviewed by Australian-registered doctors", verified: true },
      { text: "We never promise specific medications; treatment is only offered if clinically appropriate", verified: true },
      { text: "Your data is stored using the same standards as hospitals", verified: true },
    ] as Claim[],
    disclaimer: {
      title: "Medical information and limits",
      body: [
        "SIGNAL provides general health information based on your blood results. It is not a personalised diagnosis or a full medical assessment, and it does not replace your GP.",
        "Results outside the expected range may need follow-up with your GP or a specialist, and your report will say so.",
        "Any treatment, including any medication, is only ever considered separately, by a doctor, and only if it is clinically appropriate for you.",
        "Samples are analysed by accredited Australian pathology laboratories and every result is reviewed by an Australian-registered doctor.",
      ],
    },
    guarantee: {
      title: "Clear Plan or It's Free",
      body: "If after your blood draw and doctor review you feel you didn't get a clear explanation or plan for what to do next, email us within 7 days for a full refund of your {price} test fee.",
      terms: "Terms apply. Add-ons and collection fees are refunded too if you cancel before your blood is drawn.",
      verified: true,
    },
  },

  // 8. FAQ
  faq: {
    title: "Questions people ask before ordering",
    items: [
      { q: "Do I need a GP referral?", a: "No. SIGNAL is a private, out-of-pocket service, so you can order directly without a GP referral." },
      { q: "Is this covered by Medicare or private health?", a: "No. SIGNAL is not billed to Medicare or private health. It's a private service you pay for yourself." },
      { q: "What if my results are abnormal?", a: "If we see something concerning, we'll highlight it clearly in your report and recommend appropriate next steps, which may include seeing your GP or a relevant specialist." },
      { q: "Will I definitely get medication?", a: "No. SIGNAL is a testing, review and planning service. We never promise specific medications. Any treatment is only considered separately and only if clinically appropriate." },
      { q: "How long does it take from blood draw to results?", a: "Most men receive their doctor-reviewed results and plan within about 7 days of their blood draw." },
      { q: "Where do I go for my blood draw?", a: "You'll be able to choose a partner collection centre near you when you order. In some areas we also offer a mobile nurse visit." },
      { q: "What happens if I cancel or change my appointment?", a: "Change your collection time from your booking link at no cost. If you cancel before your blood is drawn, email us for a refund." },
      { q: "Is this suitable for women?", a: "Yes. The SIGNAL Test is the same comprehensive panel for everyone, and the Hormones+ add-on covers markers relevant to women as well as men. This page is written for men because that's who we're starting with." },
    ],
  },

  // 9. Close
  close: {
    headline: "Ready to stop guessing and see what's really going on?",
    sub: "Order your SIGNAL test today and get your doctor-reviewed report in about a week.",
    cta: { label: "Order your SIGNAL test – {price}", href: "/checkout" },
  },
};

/** Lowest sellable add-on price, for "from {addonsFrom}". */
export const addonsFromCents = () => Math.min(...sellableAddonsFor(signalTest).map((a) => a.priceCents ?? Infinity));
export const trackOffer = (id: "retest_6m" | "retest_3m") => retestOffers.find((o) => o.id === id && o.active) ?? null;

/** Count of lines on the page still marked unverified, for the preview banner and the claims register. */
export function unverifiedClaimCount(): number {
  const f = menFunnel;
  const all: Claim[] = [...f.trustStrip, ...f.hero.miniTrust, ...f.proof.facts, ...f.safety.bullets, { text: f.safety.guarantee.body, verified: f.safety.guarantee.verified }, ...f.plans.cards.flatMap((c) => c.bullets)];
  return all.filter((c) => !c.verified).length;
}
