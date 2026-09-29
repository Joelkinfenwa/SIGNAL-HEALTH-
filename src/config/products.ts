import type { BiomarkerCategoryId } from "./biomarkers";

export type ProductTier = "core" | "complete" | "performance";
export type CollectionMethod = "mobile" | "centre";

export interface Product {
  id: string;
  slug: string;
  tier: ProductTier;
  name: string;
  /** Short label for tight spaces (tables, mobile). */
  shortName: string;
  /** Price in cents, AUD. The server is always the source of truth for price at checkout. */
  priceCents: number;
  tagline: string;
  summary: string;
  /** One sentence: what this test helps you understand. Areas of measurement only, never conditions. */
  helps: string;
  /** Key inclusions shown in the buy box. TODO: confirm against the final analyte lists. */
  inclusions: string[];
  forWho: string[];
  categories: BiomarkerCategoryId[];
  collectionMethods: CollectionMethod[];
  /** Marks the default/recommended option. Do not label it "most popular" until sales data supports it. */
  featured: boolean;
}

/**
 * PLACEHOLDER product data. Names, biomarkers and copy will be supplied later.
 * Components read from this list only — never hard-code product details.
 */
export const products: Product[] = [
  {
    id: "prod_core",
    slug: "core",
    tier: "core",
    name: "SIGNAL Core",
    shortName: "Core",
    priceCents: 27900,
    tagline: "A clear baseline of your overall health.",
    summary: "The essential markers for understanding how your body is working today.",
    helps: "How your body is working today: heart, metabolic, liver, kidney, thyroid and nutrient basics.",
    inclusions: ["Cholesterol and lipids", "Blood sugar, including HbA1c", "Iron studies and vitamin D", "Liver, kidney and thyroid markers"],
    forWho: ["Your first comprehensive blood test", "A yearly health check-in"],
    categories: ["metabolic", "cardiovascular", "liver", "kidney", "thyroid", "nutrients"],
    collectionMethods: ["mobile", "centre"],
    featured: false,
  },
  {
    id: "prod_complete",
    slug: "complete",
    tier: "complete",
    name: "SIGNAL Complete",
    shortName: "Complete",
    priceCents: 31900,
    tagline: "The full picture, including hormones.",
    summary: "Everything in Core, plus hormones and inflammation for a more complete view.",
    helps: "The full picture, including the hormones behind energy, mood, sleep and body composition.",
    inclusions: ["Everything in Core", "Key hormones", "Inflammation markers", "Change tracked between tests"],
    forWho: ["Understanding energy, mood and sleep", "Tracking change over time"],
    categories: ["hormones", "metabolic", "cardiovascular", "liver", "kidney", "thyroid", "nutrients", "inflammation"],
    collectionMethods: ["mobile", "centre"],
    featured: true,
  },
  {
    id: "prod_performance",
    slug: "performance",
    tier: "performance",
    name: "SIGNAL Performance",
    shortName: "Performance",
    priceCents: 42900,
    tagline: "For people who train and want the detail.",
    summary: "Everything in Complete, plus markers related to muscle, recovery and training load.",
    helps: "Everything in Complete, plus the markers that relate to muscle, recovery and training load.",
    inclusions: ["Everything in Complete", "Muscle and recovery markers", "Training-load related markers", "Extended nutrient panel"],
    forWho: ["Regular training or competition", "Detailed tracking of recovery"],
    categories: ["hormones", "metabolic", "cardiovascular", "liver", "kidney", "thyroid", "nutrients", "inflammation", "performance"],
    collectionMethods: ["mobile", "centre"],
    featured: false,
  },
];

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);
export const featuredProduct = () => products.find((p) => p.featured) ?? products[0]!;
export const lowestPriceCents = () => Math.min(...products.map((p) => p.priceCents));
