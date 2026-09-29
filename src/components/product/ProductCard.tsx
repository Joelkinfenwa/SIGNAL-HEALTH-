import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { Product } from "@/config/products";
import { cx } from "@/lib/cx";
import { formatAUD } from "@/lib/money";
import styles from "./ProductCard.module.css";

/** Buy-box card. Featured product renders on the dark theme and is visually lifted. */
export function ProductCard({ product, location }: { product: Product; location: string }) {
  const headingId = `product-${product.slug}`;
  return (
    <article data-theme={product.featured ? "dark" : undefined} className={cx(styles.card, product.featured && styles.featured)} aria-labelledby={headingId}>
      <div className={styles.head}>
        <h3 id={headingId} className={styles.name}>{product.name}</h3>
        {product.featured ? <span className={styles.badge}>Recommended</span> : null}
      </div>
      <p className={styles.price}>
        <span className="num">{formatAUD(product.priceCents)}</span>
        <span className={styles.priceNote}>one test, collection options shown before you pay</span>
      </p>
      <p className={styles.helps}>{product.helps}</p>
      <p className={styles.coverage}>
        <span className="num">{product.categories.length}</span> areas of health
      </p>
      <ul className={styles.inclusions}>
        {product.inclusions.map((item) => (
          <li key={item}><Icon name="check" size={16} />{item}</li>
        ))}
      </ul>
      <div className={styles.actions}>
        <Button href={`/tests/${product.slug}`} full variant={product.featured ? "solid" : "outline"} ctaId={`choose_${product.slug}`} location={location}>
          Choose {product.shortName}
        </Button>
      </div>
    </article>
  );
}
