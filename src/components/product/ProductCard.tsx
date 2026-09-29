import { Button } from "@/components/ui/Button";
import type { Product } from "@/config/products";
import { productCategories, productMarkerCount } from "@/config/products";
import { cx } from "@/lib/cx";
import styles from "./ProductCard.module.css";

/**
 * Compact card: the question the test answers, the areas of health it
 * covers, and a way in. Marker detail lives on the product page.
 */
export function ProductCard({ product, location, className }: { product: Product; location: string; className?: string }) {
  const headingId = `product-${product.slug}`;
  const areas = productCategories(product);
  return (
    <article className={cx(styles.card, className)} aria-labelledby={headingId}>
      <div className={styles.top}>
        <p className={styles.kicker}>{product.shortName}</p>
        <h3 id={headingId} className={styles.name}>{product.name}</h3>
        <p className={styles.question}>{product.question}</p>
      </div>
      <ul className={styles.areas} aria-label="Areas of health">
        {areas.map((c) => <li key={c.id}>{c.name}</li>)}
      </ul>
      <p className={styles.counts}>
        <span className="num">{areas.length}</span> areas · <span className="num">{productMarkerCount(product)}</span> markers
      </p>
      <div className={styles.actions}>
        <Button href={`/tests/${product.slug}`} full variant="outline" ctaId={`view_${product.slug}`} location={location}>
          Explore {product.shortName}
        </Button>
      </div>
    </article>
  );
}
