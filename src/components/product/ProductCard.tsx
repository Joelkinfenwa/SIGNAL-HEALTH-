import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { biomarkerCategories } from "@/config/biomarkers";
import type { Product } from "@/config/products";
import { cx } from "@/lib/cx";
import { formatAUD } from "@/lib/money";
import styles from "./ProductCard.module.css";

export function ProductCard({ product, location }: { product: Product; location: string }) {
  const covered = biomarkerCategories.filter((c) => product.categories.includes(c.id));
  const headingId = `product-${product.slug}`;
  return (
    <article data-theme={product.featured ? "dark" : undefined} className={cx(styles.card, product.featured && styles.featured)} aria-labelledby={headingId}>
      <div className={styles.head}>
        <h3 id={headingId} className={styles.name}>{product.name}</h3>
        {product.featured ? <span className={styles.badge}>Recommended</span> : null}
      </div>
      <p className={styles.tagline}>{product.tagline}</p>
      <p className={styles.price}><span className="num">{formatAUD(product.priceCents)}</span></p>
      <p className={styles.coverage}>
        <span className="num">{covered.length}</span> health areas, including
      </p>
      <ul className={styles.areas}>
        {covered.slice(0, 5).map((c) => (
          <li key={c.id}><Icon name="check" size={16} />{c.name}</li>
        ))}
        {covered.length > 5 ? <li className={styles.more}>and {covered.length - 5} more</li> : null}
      </ul>
      <div className={styles.actions}>
        <Button href={`/tests/${product.slug}`} variant={product.featured ? "solid" : "outline"} ctaId={`choose_${product.slug}`} location={location}>
          Choose {product.shortName}
        </Button>
      </div>
    </article>
  );
}
