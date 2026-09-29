/**
 * Homepage copy and content that marketing may want to change without touching
 * components. Copy templates accept tokens: {fromPrice} {areas} {markers} {interval}
 * (filled by `fillHomeTokens()` in src/lib/home-tokens.ts).
 */

export interface HeadlineOption {
  id: string;
  text: string;
}

/** Hero headline options. `activeHeadline` selects which one renders. */
export const heroHeadlines: HeadlineOption[] = [
  { id: "know", text: "Know what your body is telling you." },
  { id: "inside", text: "See what's really going on inside." },
  { id: "score", text: "Your body keeps the score. Now you can read it." },
];
export const activeHeadline: HeadlineOption["id"] = "know";

export const hero = {
  kicker: "Advanced blood testing, made simple",
  /** One line that anchors the offer and price. The unpriced line renders until pricing is set. */
  offerLine: "Advanced blood testing from {fromPrice}, collected at home or nearby.",
  offerLineUnpriced: "Advanced blood testing, collected at home or nearby, explained in plain language.",
  primaryCta: { label: "Find my test", href: "/find-my-test" },
  secondaryCta: { label: "View tests", href: "/tests" },
  /** Small reassurance chips under the hero CTAs. Keep to three; at-home is a benefit, not a gate. */
  chips: ["Collected at home or nearby", "Clinical review included", "Results explained in plain language"],
  /** Illustrative pill over the hero photo. TODO-VERIFY: confirm home visits are offered in launch areas. */
  bookedPill: { title: "Collector visit booked", sub: "At home, Tuesday 7:30am" },
};

export interface ProofItem {
  id: string;
  icon: "chart" | "home" | "shield" | "check" | "tube" | "chat" | "pin" | "calendar" | "sparkle";
  title: string;
  body: string;
}

/** Three-item proof strip under the hero. Tokens allowed. */
export const proofStrip: ProofItem[] = [
  { id: "areas", icon: "chart", title: "{areas} areas of health", body: "Heart, hormones, metabolic, thyroid, nutrients and more from one sample." },
  { id: "home", icon: "home", title: "Collected at home or nearby", body: "A qualified collector visits where available, or drop into a collection centre." },
  { id: "review", icon: "shield", title: "Clinical review included", body: "Results are reviewed and explained in plain language." },
];

export interface Step {
  id: "choose" | "collect" | "understand" | "retest";
  label: string;
  title: string;
  body: string;
}

/** How it works. Retesting is the final step, not an add-on. Tokens allowed. */
export const steps: Step[] = [
  { id: "choose", label: "Choose", title: "Choose your test", body: "{tests} tests, each built around a question you actually have. Not sure? Answer a few questions and we'll suggest one." },
  { id: "collect", label: "Get tested", title: "Get tested, your way", body: "A qualified collector comes to your home or workplace where available. Or visit a collection centre near you." },
  { id: "understand", label: "Understand", title: "Understand your results", body: "Every marker explained in plain language, with clinical review, in your own dashboard." },
  { id: "retest", label: "Retest", title: "Retest and see the change", body: "Test again every {interval} and watch how your numbers move as you make changes." },
];

/**
 * Illustrative results card. Clearly labelled as an example in the UI.
 * No real reference ranges or clinical interpretation.
 */
export const resultsMock = {
  marker: "Vitamin D",
  value: "78",
  unit: "nmol/L",
  status: "Within range",
  change: { direction: "up" as "up" | "down" | "flat", label: "+24 since your last test" },
  explanation:
    "Vitamin D is a nutrient your body uses for bone and muscle health. Yours has risen since your last test, so what you changed appears to be working.",
  previousLabel: "March",
  currentLabel: "September",
};

export const finalCta = {
  title: "Stop guessing. Start knowing.",
  body: "Choose a test today and see how your body is really doing.",
  primaryCta: { label: "Find my test", href: "/find-my-test" },
};

export const stickyCta = {
  label: "Find my test",
  href: "/find-my-test",
  /** Tokens allowed. The unpriced line renders until pricing is set. */
  priceLine: "From {fromPrice}",
  priceLineUnpriced: "{tests} tests, one sample",
};
