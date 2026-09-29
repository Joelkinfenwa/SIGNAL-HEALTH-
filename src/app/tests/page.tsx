import type { Metadata } from "next";
import Link from "next/link";
import { Faq } from "@/components/home/Faq";
import { FinalCta } from "@/components/home/FinalCta";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { AddOns } from "@/components/product/AddOns";
import { CompareTable } from "@/components/product/CompareTable";
import { ProductCard } from "@/components/product/ProductCard";
import { Section, SectionHeader } from "@/components/ui/Section";
import { featuredProduct, products } from "@/config/products";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Compare blood tests",
  description: "Five SIGNAL blood tests, each built around a question you actually have. Compare what each one measures across areas of health.",
};

/** Compare page. Static. */
export default function TestsPage() {
  const featured = featuredProduct();
  return (
    <>
      <SiteHeader />
      <main id="main">
        <Section id="tests" theme="light" labelledBy="tests-title">
          <SectionHeader
            id="tests-title"
            eyebrow="Tests"
            title="Five tests. Each answers a different question."
            intro={`One sample, collected at home or nearby, explained in plain language. ${featured.shortName} is our recommended starting point.`}
          />
          <ul className={styles.grid} aria-label="SIGNAL tests">
            {products.map((p) => (
              <li key={p.id}><ProductCard product={p} location="tests_page" /></li>
            ))}
          </ul>
          <p className={styles.help}>
            Not sure? <Link href="/find-my-test">Answer a few quick questions</Link> and we&apos;ll recommend one.
          </p>
        </Section>

        <Section id="compare" theme="shell" labelledBy="compare-title">
          <SectionHeader
            id="compare-title"
            eyebrow="Side by side"
            title="What each test measures, by area of health."
            intro="The number in each cell is how many markers that test includes for that area. Open any test to see every marker, explained."
          />
          <CompareTable />
        </Section>

        <AddOns theme="light" />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
