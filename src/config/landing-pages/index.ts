import type { LandingPage } from "@/types/marketing";
import { heroVideo, signalMedia } from "../media";

/**
 * Paid landing pages. One entry per angle; the renderer does the rest.
 * Message match: the headline continues the ad's narrative; the product
 * stays the same. Paid pages are noindex with canonical → "/".
 *
 * recommendedAddonIds: highlighted "Recommended for you" in the configurator,
 *   NOT in the basket. preselectedAddonIds: in the basket on arrival. Use
 *   preselection only where the page's promise depends on the add-on
 *   (e.g. a hormones page, since hormones are not in the base test).
 *
 * Add a page: append a config. Test a variant: duplicate with a new slug and
 * experimentId. Never fabricate proof; proofIds/ugcIds reference approved
 * content in config/social-proof.ts.
 */
const DEFAULT_SECTIONS: LandingPage["sections"] = ["hero", "trust", "insight", "categories", "product", "addons", "how", "results", "retest", "proof", "faq", "close"];
const CORE_FAQS = ["referral", "where", "home", "timing", "review", "retest", "privacy", "included"];
const SEE_INCLUDED = { label: "See what's included", href: "#what-is-tested" };

export const landingPages: LandingPage[] = [
  {
    slug: "know-your-body",
    index: false,
    canonical: "/",
    seo: { title: "Know what's happening inside your body | SIGNAL", description: "One comprehensive blood test. See what your wearables can't." },
    eyebrow: "The SIGNAL Test",
    headline: "You track everything else. Now measure what's happening inside.",
    subheadline: "One comprehensive blood test across the major areas of your health. Collected near you, reviewed, explained in plain language.",
    heroMedia: heroVideo,
    cta: { primary: { label: "Get my SIGNAL", href: "" }, secondary: SEE_INCLUDED },
    productId: "signal",
    recommendedAddonIds: [],
    preselectedAddonIds: [],
    benefitsTitle: "What your watch can't tell you",
    benefits: [
      { title: "The inside picture", body: "Heart, metabolic, thyroid, iron, liver, kidneys and more from one sample." },
      { title: "Explained, not just reported", body: "Every marker in plain language, reviewed before you see it." },
      { title: "Track what changes", body: "Retest and see each marker move, previous to current." },
    ],
    featuredCategoryIds: ["heart", "metabolic", "thyroid", "iron"],
    faqIds: CORE_FAQS,
    proofIds: [],
    ugcIds: [],
    sections: DEFAULT_SECTIONS,
  },
  {
    slug: "performance",
    index: false,
    canonical: "/",
    seo: { title: "Train on data, not guesswork | SIGNAL", description: "The SIGNAL Test with Hormones+ and Nutrients+: the markers that shape how you train, recover and fuel." },
    eyebrow: "The SIGNAL Test · for performance",
    headline: "Train on data, not guesswork.",
    subheadline: "Iron, fuel, recovery and the hormones behind them. One comprehensive blood test, configured for people who train.",
    heroMedia: signalMedia.wide.laps,
    cta: { primary: { label: "Build my SIGNAL", href: "" }, secondary: SEE_INCLUDED },
    productId: "signal",
    recommendedAddonIds: ["hormones_plus", "nutrients_plus"],
    preselectedAddonIds: ["hormones_plus", "nutrients_plus"],
    benefitsTitle: "Built for people who train",
    benefits: [
      { title: "Oxygen carrying", body: "Full iron studies and a full blood count, in every SIGNAL." },
      { title: "Hormones, measured", body: "Hormones+ adds testosterone, SHBG, free testosterone and the signals that regulate them." },
      { title: "Fuel, measured", body: "Nutrients+ adds vitamin D, B12 and folate so you supplement on numbers, not habit." },
    ],
    featuredCategoryIds: ["iron", "blood", "hormones", "nutrients"],
    interestIds: ["training"],
    faqIds: CORE_FAQS,
    proofIds: [],
    ugcIds: [],
    sections: DEFAULT_SECTIONS,
  },
  {
    slug: "longevity",
    index: false,
    canonical: "/",
    seo: { title: "Know your numbers early | SIGNAL", description: "One comprehensive blood test, with the heart markers most check-ups never run. Measure now, track for decades." },
    eyebrow: "The SIGNAL Test · for the long game",
    headline: "The numbers worth knowing early.",
    subheadline: "Heart, metabolic, liver, kidneys and more from one sample. Add Heart+ for the particle-level cholesterol markers most check-ups skip.",
    heroMedia: signalMedia.wide.bench,
    cta: { primary: { label: "Get my SIGNAL", href: "" }, secondary: SEE_INCLUDED },
    productId: "signal",
    recommendedAddonIds: ["heart_plus"],
    preselectedAddonIds: [],
    benefitsTitle: "Measure now, track for years",
    benefits: [
      { title: "A baseline you own", body: "The major areas of your health, measured and explained, before anything changes." },
      { title: "Heart, in more depth", body: "Heart+ adds ApoB, ApoA1 and Lp(a), a marker most people have never had measured." },
      { title: "Track the trend", body: "Retest on a schedule and see every marker move over time." },
    ],
    featuredCategoryIds: ["heart", "metabolic", "liver", "kidney"],
    interestIds: ["ageing", "heart"],
    faqIds: CORE_FAQS,
    proofIds: [],
    ugcIds: [],
    sections: DEFAULT_SECTIONS,
  },
  {
    slug: "hormones",
    index: false,
    canonical: "/",
    seo: { title: "Your hormones, properly measured | SIGNAL", description: "The SIGNAL Test with Hormones+: testosterone, SHBG, free testosterone and the signals that regulate them, plus the major areas of your health." },
    eyebrow: "The SIGNAL Test + Hormones+",
    headline: "Stop guessing about your hormones.",
    subheadline: "Testosterone, SHBG, free testosterone and the signals that regulate them, alongside the major areas of your health. One sample, explained in plain language.",
    heroMedia: signalMedia.wide.walk,
    cta: { primary: { label: "Build my SIGNAL", href: "" }, secondary: SEE_INCLUDED },
    productId: "signal",
    recommendedAddonIds: ["hormones_plus"],
    preselectedAddonIds: ["hormones_plus"],
    benefitsTitle: "The system, not one number",
    benefits: [
      { title: "Available, not just total", body: "SHBG and calculated free testosterone show how much of your testosterone is actually available." },
      { title: "The signals behind it", body: "LH, FSH, oestradiol and prolactin show how the system is regulating itself." },
      { title: "In context", body: "Read alongside iron, thyroid, metabolic and liver markers from the same sample." },
    ],
    featuredCategoryIds: ["hormones", "thyroid", "iron", "metabolic"],
    interestIds: ["hormones"],
    faqIds: CORE_FAQS,
    proofIds: [],
    ugcIds: [],
    sections: DEFAULT_SECTIONS,
  },
  {
    slug: "runners",
    index: false,
    canonical: "/",
    seo: { title: "Your watch can't measure everything | SIGNAL", description: "Iron, fuel and the markers that shape how you run. One comprehensive blood test." },
    eyebrow: "The SIGNAL Test · for runners",
    headline: "Your watch can't measure everything.",
    subheadline: "Pace, sleep and HRV tell part of the story. Iron, fuel and hormones tell the rest. One comprehensive blood test, with Nutrients+ and Hormones+ if you want the detail.",
    heroMedia: signalMedia.wide.climb,
    cta: { primary: { label: "Build my SIGNAL", href: "" }, secondary: SEE_INCLUDED },
    productId: "signal",
    recommendedAddonIds: ["nutrients_plus", "hormones_plus"],
    preselectedAddonIds: [],
    benefitsTitle: "Built for people who run",
    benefits: [
      { title: "Oxygen carrying", body: "Full iron studies and a full blood count, in every SIGNAL." },
      { title: "Fuel, measured", body: "Add Nutrients+ for vitamin D, B12 and folate before you buy another supplement." },
      { title: "Track a training block", body: "Retest and see exactly what a block changed." },
    ],
    featuredCategoryIds: ["iron", "blood", "nutrients", "hormones"],
    interestIds: ["training"],
    faqIds: CORE_FAQS,
    proofIds: [],
    ugcIds: [],
    sections: DEFAULT_SECTIONS,
  },
  {
    slug: "supplements",
    index: false,
    canonical: "/",
    seo: { title: "Stop guessing what your body needs | SIGNAL", description: "Measure your iron, vitamin D, B12, folate and minerals before you buy another supplement." },
    eyebrow: "The SIGNAL Test + Nutrients+",
    headline: "Stop guessing what your body needs.",
    subheadline: "Iron, magnesium and calcium in every SIGNAL. Add Nutrients+ for vitamin D, B12 and folate. Measured from one sample, explained in plain language. Then decide.",
    heroMedia: signalMedia.wide.walk,
    cta: { primary: { label: "Build my SIGNAL", href: "" }, secondary: SEE_INCLUDED },
    productId: "signal",
    recommendedAddonIds: ["nutrients_plus"],
    preselectedAddonIds: ["nutrients_plus"],
    benefitsTitle: "Measure first",
    benefits: [
      { title: "Nutrients and minerals, measured", body: "Iron studies, magnesium and calcium in every SIGNAL; vitamin D, B12 and folate with Nutrients+." },
      { title: "Plain-language results", body: "Where each marker sits, explained. Reviewed before you see it." },
      { title: "See what changed", body: "Retest later and compare, marker by marker." },
    ],
    featuredCategoryIds: ["nutrients", "minerals", "iron"],
    interestIds: ["nutrition"],
    faqIds: CORE_FAQS,
    proofIds: [],
    ugcIds: [],
    sections: DEFAULT_SECTIONS,
  },
];

export const getLandingPage = (slug: string) => landingPages.find((p) => p.slug === slug);
