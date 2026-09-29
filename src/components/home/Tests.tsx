import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";
import { Section, SectionHeader } from "@/components/ui/Section";
import { featuredProduct, products } from "@/config/products";
import styles from "./Tests.module.css";

/**
 * Five tests as a buy box. On small screens a snap-scrolling row (featured
 * first); on wide screens a grid with the featured product lifted.
 */
export function Tests() {
  const featured = featuredProduct();
  const ordered = [featured, ...products.filter((p) => p.id !== featured.id)];
  return (
    <Section id="tests" theme="shell" labelledBy="tests-title">
      <SectionHeader
        id="tests-title"
        eyebrow="Tests"
        align="center"
        title="Built around the question you're actually asking."
        intro={`Five tests, one sample. ${featured.shortName} is our recommended starting point.`}
      />
      <ul className={styles.row} aria-label="SIGNAL tests">
        {ordered.map((p) => (
          <li key={p.id} className={p.featured ? styles.featuredSlot : styles.slot}>
            <ProductCard product={p} location="home_tests" />
          </li>
        ))}
      </ul>
      <p className={styles.help}>
        <Link href="/tests">Compare all five tests</Link>, or <Link href="/find-my-test">answer a few quick questions</Link> and we&apos;ll recommend one.
      </p>
    </Section>
  );
}
