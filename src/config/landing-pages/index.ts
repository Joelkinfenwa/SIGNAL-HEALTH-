import type { LandingPage } from "@/types/marketing";
import { heroVideo, signalMedia } from "../media";

/**
 * Paid landing pages. One entry per angle; the renderer does the rest.
 * Message match: the headline continues the ad's narrative; the product
 * stays the same. Paid pages are noindex with canonical → "/".
 *
 * Add a page: append a config. Test a variant: duplicate with a new slug and
 * experimentId. Never fabricate proof; proofIds/ugcIds reference approved
 * content in config/social-proof.ts.
 */
const DEFAULT_SECTIONS: LandingPage["sections"] = ["hero", "trust", "insight", "categories", "product", "addons", "how", "results", "retest", "proof", "faq", "close"];
const CORE_FAQS = ["referral", "where", "home", "timing", "review", "retest", "privacy", "included"];

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
    cta: { primary: { label: "Get my SIGNAL", href: "" }, secondary: { label: "See what's included", href: "#what-is-tested" } },
    productId: "signal",
    recommendedAddonIds: [],
    preselectedAddonIds: [],
    benefitsTitle: "What your watch can't tell you",
    benefits: [
      { title: "The inside picture", body: "Heart, hormones, metabolic, thyroid, iron, nutrients and more from one sample." },
      { title: "Explained, not just reported", body: "Every marker in plain language, reviewed before you see it." },
      { title: "Track what changes", body: "Retest and see each marker move, previous to current." },
    ],
    featuredCategoryIds: ["heart", "hormones", "metabolic", "nutrients"],
    faqIds: CORE_FAQS,
    proofIds: [],
    ugcIds: [],
    sections: DEFAULT_SECTIONS,
  },
  {
    slug: "runners",
    index: false,
    canonical: "/",
    seo: { title: "Your watch can't measure everything | SIGNAL", description: "Iron, recovery, fuel and the markers that shape how you train. One blood test." },
    eyebrow: "The SIGNAL Test · for runners",
    headline: "Your watch can't measure everything.",
    subheadline: "Pace, sleep and HRV tell part of the story. Iron, recovery and fuel markers tell the rest. One comprehensive blood test, plus Performance+ if you want the detail.",
    heroMedia: signalMedia.wide.climb,
    cta: { primary: { label: "Build my SIGNAL", href: "" }, secondary: { label: "See what's included", href: "#what-is-tested" } },
    productId: "signal",
    recommendedAddonIds: ["performance_plus"],
    preselectedAddonIds: ["performance_plus"],
    benefitsTitle: "Built for people who train",
    benefits: [
      { title: "Oxygen carrying", body: "Full iron studies and a full blood count, in every SIGNAL." },
      { title: "Recovery, measured", body: "Add Performance+ for muscle load, stress and recovery markers." },
      { title: "Track a training block", body: "Retest and see exactly what a block changed." },
    ],
    featuredCategoryIds: ["iron", "blood", "recovery", "nutrients"],
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
    eyebrow: "The SIGNAL Test",
    headline: "Stop guessing what your body needs.",
    subheadline: "Iron, vitamin D, B12, folate, magnesium and more, measured from one sample and explained in plain language. Then decide.",
    heroMedia: signalMedia.wide.walk,
    cta: { primary: { label: "Get my SIGNAL", href: "" }, secondary: { label: "See what's included", href: "#what-is-tested" } },
    productId: "signal",
    recommendedAddonIds: ["nutrients_plus"],
    preselectedAddonIds: [],
    benefitsTitle: "Measure first",
    benefits: [
      { title: "Nutrients and minerals, measured", body: "Vitamin D, B12, folate, iron studies, magnesium, calcium and more in every SIGNAL." },
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
