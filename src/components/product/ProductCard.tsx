import { Button } from "@/components/ui/Button";
import type { Product } from "@/config/products";
import { productCategoryCount, productMarkerCount } from "@/config/products";
import { cx } from "@/lib/cx";
import { PanelLearn } from "./PanelLearn";
import { PriceTag } from "./PriceTag";
import styles from "./ProductCard.module.css";

/**
 * Buy-box card. Leads with the question the test answers and what you'll
 * learn, not a line-item count. Featured product renders on the dark theme.
 */
export function ProductCard({ product, location }: { product: Product; location: string }) {
  const headingId = `product-${product.slug}`;
  return (
    <article data-theme={product.featured ? "dark" : undefined} className={cx(styles.card, product.featured && styles.featured)} aria-labelledby={headingId}>
      <div className={styles.head}>
        <h3 id={headingId} className={styles.name}>{product.name}</h3>
        {product.featured ? <span className={styles.badge}>Recommended</span> : null}
      </div>
      <p className={styles.question}>&ldquo;{product.question}&rdquo;</p>
      <PriceTag priceCents={product.priceCents} className={styles.price} />
      <p className={styles.counts}>
        <span className="num">{productCategoryCount(product)}</span> areas of health · <span className="num">{productMarkerCount(product)}</span> markers
      </p>
      <PanelLearn markers={product.markers} only={product.highlights} limit={3} variant="compact" className={styles.learn} />
      <div className={styles.actions}>
        <Button href={`/tests/${product.slug}`} full variant={product.featured ? "solid" : "outline"} ctaId={`view_${product.slug}`} location={location}>
          Explore {product.shortName}
        </Button>
      </div>
    </article>
  );
}
