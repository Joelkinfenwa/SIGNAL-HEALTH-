import { notFound } from "next/navigation";
import { PlannedPage } from "@/components/layout/PlannedPage";
import { getProduct, products } from "@/config/products";

export const dynamicParams = false;
export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const product = getProduct((await params).slug);
  return { title: product?.name ?? "Test" };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const product = getProduct((await params).slug);
  if (!product) notFound();
  return (
    <PlannedPage
      title={product.name}
      purpose="Product page: outcome, price, who it's for, biomarker areas (expandable analyte list), collection options, what happens after purchase, FAQ, CTA. Phase 1b."
    />
  );
}
