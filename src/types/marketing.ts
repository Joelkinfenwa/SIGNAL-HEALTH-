/**
 * Marketing and acquisition types. These describe content and attribution,
 * never clinical data.
 */
import type { InterestId } from "@/config/interests";
import type { MediaAsset, VideoAsset } from "@/config/media";

export type LandingSection =
  | "hero" | "trust" | "insight" | "categories" | "product" | "addons" | "how" | "results" | "retest" | "proof" | "faq" | "close";

export interface LandingPage {
  slug: string;
  /** Ties the page to an experiment for analytics; optional. */
  experimentId?: string;
  /** Paid pages default to noindex with canonical → "/". */
  index: boolean;
  canonical: string;
  seo: { title: string; description: string; ogImage?: string };
  eyebrow?: string;
  headline: string;
  subheadline: string;
  heroMedia: MediaAsset | VideoAsset;
  cta: { primary: { label: string; href: string }; secondary?: { label: string; href: string } };
  productId: "signal";
  recommendedAddonIds: string[];
  preselectedAddonIds: string[];
  benefits: { title: string; body: string }[];
  featuredCategoryIds: string[];
  interestIds?: InterestId[];
  faqIds: string[];
  /** Ids from config/social-proof.ts; empty renders nothing. */
  proofIds: string[];
  ugcIds: string[];
  sections: LandingSection[];
}

export interface Creator {
  id: string;
  handle: string;
  platform: "instagram" | "tiktok" | "youtube" | "other";
  /** Trybe or other network identifier. */
  networkId?: string;
}

export interface Campaign {
  id: string;
  channel: "meta" | "google" | "tiktok" | "trybe" | "email" | "organic";
  angle: string;
  landingSlug: string;
  creatorId?: string;
  /** utm_content parts: creator.hook.creative */
  hook?: string;
  creative?: string;
  startedOn: string;
}

/** Parsed from utm_content = {creator}.{hook}.{creative}; never guessed. */
export interface CreativeAttribution {
  creator?: string;
  hook?: string;
  creative?: string;
}
