import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductViewTracker } from "@/components/analytics/ProductViewTracker";
import { Faq } from "@/components/home/Faq";
import { FinalCta } from "@/components/home/FinalCta";
import { HowItWorks } from "@/components/home/HowItWorks";
import { StickyCta } from "@/components/home/StickyCta";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { AddOns } from "@/components/product/AddOns";
import { Included } from "@/components/product/Included";
import { RetestPlans } from "@/components/retest/RetestPlans";
import { ProductHero } from "@/components/product/ProductHero";
import { ProductLearn } from "@/components/product/ProductLearn";
import { getProduct, productCategoryCount, productMarkerCount, products } from "@/config/products";
import { formatAUD } from "@/lib/money";

export const dynamicParams = false;
export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const product = getProduct((await params).slug);
  if (!product) return { title: "Test" };
  return {
    title: `${product.name}: ${product.tagline}`,
    description: `${product.helps} ${productMarkerCount(product)} markers across ${productCategoryCount(product)} areas of health, collected at home or nearby.`,
  };
}

/** Product page. Static. Client JS: analytics view event and the sticky CTA. */
export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const product = getProduct((await params).slug);
  if (!product) notFound();
  const priceLine = product.priceCents !== null ? formatAUD(product.priceCents) : `${productMarkerCount(product)} markers`;
  return (
    <>
      <SiteHeader />
      <main id="main">
        <ProductHero product={product} />
        <ProductLearn product={product} />
        <AddOns product={product} />
        <Included />
        <RetestPlans product={product} />
        <HowItWorks />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
      <StickyCta priceLine={priceLine} href={`/checkout/${product.slug}`} label={`Choose ${product.shortName}`} ctaId={`sticky_choose_${product.slug}`} />
      <ProductViewTracker productId={product.id} tier={product.tier} priceCents={product.priceCents} />
    </>
  );
}
