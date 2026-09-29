import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";
import { Section, SectionHeader } from "@/components/ui/Section";
import { featuredProduct, products } from "@/config/products";
import styles from "./Tests.module.css";

/** Three products as a side-by-side buy box; the featured product is visually lifted. */
export function Tests() {
  const featured = featuredProduct();
  return (
    <Section id="tests" theme="shell" labelledBy="tests-title">
      <SectionHeader
        id="tests-title"
        eyebrow="Tests"
        align="center"
        title="Three tests. One clear choice."
        intro={`Each test builds on the last. ${featured.shortName} is our recommended starting point.`}
      />
      <div className={styles.grid}>
        {products.map((p) => (
          <div key={p.id} className={p.featured ? styles.featuredSlot : undefined}>
            <ProductCard product={p} location="home_tests" />
          </div>
        ))}
      </div>
      <p className={styles.help}>
        Not sure which is right for you? <Link href="/find-my-test">Answer a few quick questions</Link> and we&apos;ll recommend one.
      </p>
    </Section>
  );
}
