/**
 * Funnel page: /men. Direct-response structure (hook → stack → steps → fit →
 * proof → offer → risk reversal → FAQ → close). Every word on the page is
 * here so sections can be rewritten and tested without touching JSX.
 *
 * Claims: each trust/guarantee line carries `verified`. Unverified lines
 * still render (this is the brief's copy) but are listed in the README
 * claims register and counted in a preview-only banner. Clear them with
 * clinical, operations and legal before sending paid traffic.
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
    { text: "Australian-registered doctors", verified: false },
    { text: "TGA-compliant", verified: false },
  ] as Claim[],
  hero: {
    headline: "Australian men 30–60: Get a doctor-reviewed blood panel that finally explains your fatigue, mood and energy in 7 days.",
    subheadline: "One visit, one comprehensive panel, reviewed by an Australian-registered doctor with a clear, plain-English plan for what to do next.",
    primaryCta: { label: "Order your SIGNAL test – {price}", href: "/checkout" },
    secondaryCta: { label: "Or see what's included first", href: "#included" },
    miniTrust: [
      { text: "No GP referral needed", verified: false },
      { text: "Results and doctor review in around 7 days", verified: false },
      { text: "Clear-plan-or-it's-free guarantee", verified: false },
    ] as Claim[],
  },

  // 2. What you get
  included: {
    title: "What you actually get when you order SIGNAL",
    intro: "When you order a SIGNAL test, you're not just getting numbers. You're getting a full check, a doctor's eyes on your results, and a written plan.",
    bullets: [
      { title: "One comprehensive blood panel", body: "Covering energy, hormones, heart, metabolism and key nutrients. {markers} markers across {areas} areas in the base test." },
      { title: "Doctor-reviewed results", body: "Reviewed by an Australian-registered doctor, not just auto-generated ranges." },
      { title: "A clear, written plan", body: "What's normal, what's not, and what to do next, explained in plain English." },
      { title: "Optional add-ons in the same blood draw", body: "Hormones, thyroid, heart and more, from {addonsFrom}. One needle, no second visit." },
    ],
  },

  // 3. How it works
  steps: {
    title: "How SIGNAL works, start to finish",
    items: [
      { icon: "calendar", photo: "nurse", title: "Order online in 3 minutes", body: "Pay securely and choose your preferred collection location." },
      { icon: "tube", photo: "draw", title: "Get your blood drawn", body: "At a partner collection centre or by a mobile nurse where available. No GP referral." },
      { icon: "shield", photo: "review", title: "A doctor reviews your results", body: "Checking for red flags and patterns, not just individual numbers." },
      { icon: "chart", photo: "order", title: "Get your report and plan", body: "Your results and next-step plan delivered in around 7 days." },
    ] as { icon: "calendar" | "tube" | "shield" | "chart"; photo: "order" | "draw" | "review" | "nurse"; title: string; body: string }[],
  },

  // 4. Who it's for
  fit: {
    title: "Who SIGNAL is (and isn't) for",
    bestForTitle: "Best for",
    bestFor: [
      "Men 30–60 feeling tired, flat, low drive or “not myself”",
      "Men who want clear numbers and a medical-grade view, not TikTok guesses",
      "Men happy to pay privately for clarity and a plan",
    ],
    notForTitle: "Not for",
    notFor: [
      "Wanting specific medications guaranteed",
      "Wanting a free GP-style check-up billed to Medicare",
      "Unwilling to act on results",
    ],
  },

  // 5. Proof
  proof: { title: "Real people, real answers", intro: "What customers say about the experience.", cta: { label: "Order your SIGNAL test – {price}", href: "/checkout" } },

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
        badge: "Most popular", // DECISION: a popularity claim needs data behind it (ACL). Change or remove here.
        priceLine: "{track6Price} per test",
        priceSub: "2 tests a year · {track6Discount} off · charged per test",
        tagline: "Best if you want to keep an eye on things over time.",
        bullets: [
          { text: "Two panels a year at member pricing", verified: true },
          { text: "Priority doctor review", verified: false },
          { text: "Member-only perk: free hormone add-on on your first draw", verified: false },
          { text: "Change the date, pause or cancel any time", verified: true },
        ],
        cta: { label: "Get started", href: "/checkout?plan=retest_6m" },
      },
      {
        id: "retest_3m",
        name: "SIGNAL Track+",
        priceLine: "{track3Price} per test",
        priceSub: "4 tests a year · {track3Discount} off · charged per test",
        tagline: "Best for high performers or complex cases.",
        bullets: [
          { text: "Four panels a year at the lowest per-test price", verified: true },
          { text: "Priority booking", verified: false },
          { text: "One at-home collector visit included each year", verified: false },
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
    disclosure: "SIGNAL Track and Track+ use recurring billing: after today's test you confirm the plan, the member discount on today's order is refunded to your card, and each future test is charged at the member price at the start of each interval until you cancel. Change the date, pause or cancel any time from your account.",
  },

  // 7. Safety and guarantee
  safety: {
    title: "Safe, doctor-led, and TGA-compliant",
    bullets: [
      { text: "Tests processed by accredited Australian labs", verified: false },
      { text: "Results reviewed by Australian-registered doctors", verified: false },
      { text: "We never promise specific medications; treatment is only offered if clinically appropriate", verified: false },
      { text: "Your data is stored using the same standards as hospitals", verified: false },
    ] as Claim[],
    guarantee: {
      title: "Clear Plan or It's Free",
      body: "If after your blood draw and doctor review you feel you didn't get a clear explanation or plan for what to do next, email us within 7 days for a full refund of your {price} test fee.",
      verified: false,
    },
  },

  // 8. FAQ
  faq: {
    title: "Questions people ask before ordering",
    items: [
      { q: "Do I need a GP referral?", a: "No. SIGNAL is a private, out-of-pocket service, so you can order directly without a GP referral." },
      { q: "Is this covered by Medicare or private health?", a: "No. SIGNAL is not billed to Medicare or private health. It's a private service you pay for yourself." },
      { q: "What if my results are abnormal?", a: "If we see something concerning, we'll highlight it clearly in your report and recommend appropriate next steps, which may include seeing your GP or a relevant specialist." },
      { q: "Will I definitely get medication?", a: "No. SIGNAL is a diagnostic and planning service. We never promise specific medications. Any treatment is only considered separately and only if clinically appropriate." },
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
  const all: Claim[] = [...f.trustStrip, ...f.hero.miniTrust, ...f.safety.bullets, { text: f.safety.guarantee.body, verified: f.safety.guarantee.verified }, ...f.plans.cards.flatMap((c) => c.bullets)];
  return all.filter((c) => !c.verified).length;
}
