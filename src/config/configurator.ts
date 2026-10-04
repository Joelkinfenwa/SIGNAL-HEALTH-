/**
 * Configurator copy and CRO knobs. Everything a marketer might want to test
 * lives here, not in JSX: headings, microcopy, badge use and add-on order
 * (order itself is `signalTest.addonIds`).
 *
 * Heading variants are keyed so an experiment can pick one at runtime
 * (config/experiments.ts "configurator_heading").
 */
export type ConfiguratorHeadingVariant = "personalise" | "deeper";

export const configuratorHeadings: Record<ConfiguratorHeadingVariant, { title: string; body: string }> = {
  personalise: {
    title: "Personalise your SIGNAL",
    body: "The SIGNAL Test already covers the major areas. Add depth where it matters to you. Add or remove any time before you pay.",
  },
  deeper: {
    title: "Go deeper where it matters to you.",
    body: "The SIGNAL Test already covers the major areas. Add-ons are optional depth. Add or remove any time before you pay.",
  },
};

export const configuratorCopy = {
  defaultHeading: "personalise" as ConfiguratorHeadingVariant,
  step1Label: "The test",
  step1Body: "The comprehensive base. Always included.",
  step2Label: "Make it yours",
  includedLabel: "Included",
  addLabel: "Add to your SIGNAL",
  addedLabel: "Added to your SIGNAL",
  removeHint: "Tap to remove",
  comingLabel: "Coming soon",
  comingHint: "Not available to add yet",
  recommendedLabel: "Recommended for you",
  detailsLabel: "Why these markers",
  markersLabel: (n: number) => `Adds ${n} ${n === 1 ? "marker" : "markers"}`,
  markersUnit: (n: number) => `+${n} ${n === 1 ? "marker" : "markers"}`,
  additionalMarkers: (n: number) => `${n} additional ${n === 1 ? "marker" : "markers"}`,
  summaryTitle: "Your SIGNAL",
  summaryEmpty: "No add-ons yet. Add depth where it matters to you.",
  coverageTitle: "Coverage",
  coverageLink: "See every marker",
  removeLabel: (name: string) => `Remove ${name}`,
  /** Reassurance under the button. Centre-collection line only renders when the centre fee is $0. */
  summaryTrust: { centreIncluded: "Collection at a centre included", payment: "Card, Apple Pay and Google Pay" },
  summaryRetestHint: "Automatic Retesting saves up to {discount} on every test. Offered after checkout.",
  continueLabel: "Continue",
  continueNote: "Collection options and any details are shown before you pay.",
  stickyLabel: "Your SIGNAL",
  quizPrompt: "Not sure?",
  quizLink: "Answer four quick questions",
  quizAfter: "and we'll suggest the add-ons that fit.",
  priceTbc: "Price TBC",
  pricingSoon: "Pricing coming soon",
};

export function resolveHeadingVariant(variant: string | undefined): ConfiguratorHeadingVariant {
  return variant && variant in configuratorHeadings ? (variant as ConfiguratorHeadingVariant) : configuratorCopy.defaultHeading;
}
