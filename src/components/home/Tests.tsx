import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";
import { Container } from "@/components/ui/Container";
import { media } from "@/config/media";
import { products } from "@/config/products";
import { Photo } from "./Photo";
import styles from "./Tests.module.css";

export function Tests() {
  return (
    <section id="tests" data-theme="shell" className={styles.section} aria-labelledby="tests-title">
      <Container>
        <div className={styles.banner}>
          <Photo asset={media.tubes} sizes="(min-width: 76rem) 76rem, 100vw" className={styles.bannerPhoto} position="center 60%" />
          <div className={styles.bannerCopy}>
            <h2 id="tests-title" className={styles.title}>Three tests. One clear choice.</h2>
            <p className={styles.intro}>Each test builds on the last. Complete is our recommended starting point.</p>
          </div>
        </div>
        <div className={styles.grid}>
          {products.map((p) => (
            <div key={p.id} className={p.featured ? styles.featuredSlot : undefined}>
              <ProductCard product={p} location="home_tests" />
            </div>
          ))}
        </div>
        <p className={styles.help}>
          Not sure which to choose? <Link href="/find-my-test">Answer a few quick questions</Link> and we&apos;ll recommend one.
        </p>
      </Container>
    </section>
  );
}
