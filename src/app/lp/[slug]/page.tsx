import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LandingPage } from "@/components/lp/LandingPage";
import { getLandingPage, landingPages } from "@/config/landing-pages";

export const dynamicParams = false;
export function generateStaticParams() {
  return landingPages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const page = getLandingPage((await params).slug);
  if (!page) return {};
  return {
    title: { absolute: page.seo.title },
    description: page.seo.description,
    robots: page.index ? undefined : { index: false, follow: true },
    alternates: { canonical: page.canonical },
    openGraph: page.seo.ogImage ? { images: [page.seo.ogImage] } : undefined,
  };
}

/** Paid landing page from config. Static per slug. */
export default async function LandingPageRoute({ params }: { params: Promise<{ slug: string }> }) {
  const page = getLandingPage((await params).slug);
  if (!page) notFound();
  return <LandingPage page={page} />;
}
