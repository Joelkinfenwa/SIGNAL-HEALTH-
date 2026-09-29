import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { productHeroMedia, productHeroWide } from "@/config/media";
import { productCategoryCount, productMarkerCount, type Product } from "@/config/products";
import { PriceTag } from "./PriceTag";
import styles from "./ProductHero.module.css";

/**
 * Full-bleed product hero in the same language as the homepage: what it is,
 * one primary action, and the three facts that matter. The header floats over it.
 */
export function ProductHero({ product }: { product: Product }) {
  const image = productHeroWide[product.tier] ?? productHeroMedia[product.tier];
  const areas = productCategoryCount(product);
  const markers = productMarkerCount(product);
  return (
    <section id="hero" data-theme="dark" className={styles.hero} aria-labelledby="product-title">
      <div className={styles.media} aria-hidden="true">
        {image.src ? <Image src={image.src} alt="" fill priority sizes="100vw" style={{ objectFit: "cover", objectPosition: "70% 40%" }} /> : null}
        <div className={styles.shade} />
      </div>
      <Container className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.kicker}>
            SIGNAL {product.shortName}
            {product.featured ? <span className={styles.badge}>Recommended</span> : null}
          </p>
          <h1 id="product-title" className={styles.title}>{product.tagline}</h1>
          <p className={styles.promise}>{product.promise}</p>
          <ul className={styles.chips} aria-label="At a glance">
            <li><Icon name="check" size={14} /> <span className="num">{areas}</span> areas of health, <span className="num">{markers}</span> markers</li>
            <li><Icon name="check" size={14} /> Collected at home or nearby</li>
            <li><Icon name="check" size={14} /> Every marker explained</li>
          </ul>
        </div>
        <div className={styles.buy}>
          <p className={styles.buyName}>{product.name}</p>
          <PriceTag priceCents={product.priceCents} size="lg" className={styles.price} />
          <div className={styles.actions}>
            <Button href={`/checkout/${product.slug}`} full ctaId={`choose_${product.slug}`} location="product_hero">
              Choose {product.shortName} <Icon name="arrow" size={18} />
            </Button>
            <Button href="/tests" full variant="outline" ctaId="product_compare" location="product_hero">Compare tests</Button>
          </div>
          <p className={styles.buyNote}>Collection options and any details are shown before you pay.</p>
        </div>
      </Container>
    </section>
  );
}
