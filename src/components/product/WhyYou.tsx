import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import type { Product } from "@/config/products";
import styles from "./WhyYou.module.css";

/** "Is this you?": three situations, then what you walk away with. Why they might need it, fast. */
export function WhyYou({ product }: { product: Product }) {
  return (
    <section id="why-you" data-theme="light" className={styles.section} aria-labelledby="whyyou-title">
      <Container className={styles.inner}>
        <div>
          <p className={styles.eyebrow}>Is this you?</p>
          <h2 id="whyyou-title" className={styles.title}>{product.shortName} is for you if&hellip;</h2>
        </div>
        <ul className={styles.list}>
          {product.whyYou.map((w) => (
            <li key={w} className={styles.item}><span className={styles.tick}><Icon name="check" size={16} /></span>{w}</li>
          ))}
        </ul>
        <div className={styles.outcome}>
          <p className={styles.outcomeLabel}>What you walk away with</p>
          <p className={styles.outcomeBody}>{product.outcome}</p>
        </div>
      </Container>
    </section>
  );
}
