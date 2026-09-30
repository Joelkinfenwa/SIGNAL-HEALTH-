/**
 * Homepage copy and content. Marketing edits here, not in components.
 * Copy templates accept tokens: {fromPrice} {areas} {markers} {product} {interval}
 * (filled by `fillHomeTokens()` in src/lib/home-tokens.ts).
 */

export interface HeadlineOption {
  id: string;
  text: string;
}

/** Hero headline options; `activeHeadline` selects. Candidates for the home_headline experiment. */
export const heroHeadlines: HeadlineOption[] = [
  { id: "inside", text: "Know what's happening inside your body." },
  { id: "measure", text: "Stop guessing. Start measuring." },
  { id: "telling", text: "Know what your body is telling you." },
];
export const activeHeadline: HeadlineOption["id"] = "inside";

export const hero = {
  eyebrow: "The SIGNAL Test · by Express Pathology",
  /** Priced and unpriced variants; the unpriced line renders until pricing is set. */
  subheadline: "One comprehensive blood test. A clearer picture of what's happening inside your body, from {fromPrice}.",
  subheadlineUnpriced: "One comprehensive blood test. A clearer picture of what's happening inside your body.",
  primaryCta: { label: "Get my SIGNAL", href: "/signal" },
  secondaryCta: { label: "See what's included", href: "/#what-is-tested" },
  /** Three reassurance chips. Facts only; anything unverified belongs in config/trust.ts as a placeholder. */
  chips: ["{areas} areas of health, {markers} markers", "Collected at a centre or at home", "Explained in plain language"],
};

/** D. The core insight: people measure everything except what's inside. */
export const insight = {
  eyebrow: "The core insight",
  title: "You track everything else.",
  tracked: [
    { label: "Steps", value: "9,412" },
    { label: "Sleep", value: "7h 12m" },
    { label: "Resting HR", value: "54" },
    { label: "Pace", value: "4:52 /km" },
    { label: "Recovery", value: "82%" },
  ],
  body: "Your watch knows your steps. Your app knows your sleep. Your plan knows your pace. None of them can see what's happening in your blood.",
  close: "SIGNAL measures the part the wearables can't.",
  cta: { label: "See what SIGNAL measures", href: "/#what-is-tested" },
};

export interface Step {
  id: "choose" | "collect" | "understand" | "retest";
  label: string;
  title: string;
  body: string;
}

/** H. How it works. Tokens allowed. */
export const steps: Step[] = [
  { id: "choose", label: "Choose", title: "Choose your SIGNAL", body: "The comprehensive test, plus any add-ons you want. About two minutes." },
  { id: "collect", label: "Collect", title: "Get collected", body: "At a collection centre, or at home where available. A few minutes with a qualified collector." },
  { id: "understand", label: "Understand", title: "Get your results", body: "Returned digitally, reviewed, and explained marker by marker in plain language." },
  { id: "retest", label: "Track", title: "Track over time", body: "Retest every {interval} and see exactly what's changed." },
];

/**
 * I. Results preview. Illustrative; labelled as an example in the UI.
 * previous → current pairs demonstrate tracking, never real results.
 */
export interface PreviewMarker {
  markerId: string;
  unit: string;
  previous: string;
  current: string;
  direction: "up" | "down" | "flat";
  note: string;
}
export const resultsPreview: { previousLabel: string; currentLabel: string; markers: PreviewMarker[] } = {
  previousLabel: "March",
  currentLabel: "September",
  markers: [
    { markerId: "ldl", unit: "mmol/L", previous: "3.4", current: "2.9", direction: "down", note: "Lower than last time." },
    { markerId: "ferritin", unit: "µg/L", previous: "38", current: "61", direction: "up", note: "Iron stores have risen." },
    { markerId: "hba1c", unit: "%", previous: "5.6", current: "5.4", direction: "down", note: "Slightly lower than last time." },
  ],
};

/** M. Final close. */
export const finalCta = {
  title: "Stop guessing. Know your numbers.",
  body: "One comprehensive blood test. Collected near you, explained in plain language.",
  primaryCta: { label: "Get my SIGNAL", href: "/signal" },
};

export const stickyCta = {
  label: "Get my SIGNAL",
  href: "/signal",
  priceLine: "From {fromPrice}",
  priceLineUnpriced: "{markers} markers, one test",
};
