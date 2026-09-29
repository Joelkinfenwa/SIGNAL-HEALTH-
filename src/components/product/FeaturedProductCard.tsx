import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { Product } from "@/config/products";
import { productCategories, productMarkerCount } from "@/config/products";
import { PanelLearn } from "./PanelLearn";
import styles from "./FeaturedProductCard.module.css";

/**
 * The hero product, given the room it deserves: the question, what you'll
 * learn (highlight areas with example markers) and one clear action.
 */
export function FeaturedProductCard({ product, location }: { product: Product; location: string }) {
  const headingId = `product-${product.slug}`;
  const areas = productCategories(product);
  const rest = areas.filter((c) => !product.highlights.includes(c.id));
  return (
    <article data-theme="dark" className={styles.card} aria-labelledby={headingId}>
      <div className={styles.copy}>
        <p className={styles.kicker}><span className={styles.badge}>Recommended</span> {product.shortName}</p>
        <h3 id={headingId} className={styles.name}>{product.name}</h3>
        <p className={styles.tagline}>{product.tagline}</p>
        <p className={styles.question}>&ldquo;{product.question}&rdquo;</p>
        <p className={styles.counts}>
          <span className="num">{areas.length}</span> areas of health · <span className="num">{productMarkerCount(product)}</span> markers, every one explained
        </p>
        <div className={styles.actions}>
          <Button href={`/tests/${product.slug}`} ctaId={`view_${product.slug}`} location={location}>
            Explore {product.shortName} <Icon name="arrow" size={18} />
          </Button>
        </div>
      </div>
      <div className={styles.learn}>
        <p className={styles.learnTitle}>What you&apos;ll learn</p>
        <PanelLearn markers={product.markers} only={product.highlights} limit={4} variant="chips" />
        {rest.length > 0 ? (
          <p className={styles.rest}>Plus {rest.map((c) => c.name.toLowerCase()).join(", ")}.</p>
        ) : null}
      </div>
    </article>
  );
}
