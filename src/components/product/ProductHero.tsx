import { Photo } from "@/components/home/Photo";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { productHeroMedia } from "@/config/media";
import { productCategoryCount, productMarkerCount, type Product } from "@/config/products";
import { PriceTag } from "./PriceTag";
import styles from "./ProductHero.module.css";

export function ProductHero({ product }: { product: Product }) {
  return (
    <section id="hero" data-theme="light" className={styles.hero} aria-labelledby="product-title">
      <Container className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.kicker}>SIGNAL test{product.featured ? <span className={styles.badge}>Recommended</span> : null}</p>
          <h1 id="product-title" className={styles.title}>{product.name}</h1>
          <p className={styles.tagline}>{product.tagline}</p>
          <p className={styles.question}>&ldquo;{product.question}&rdquo;</p>
          <p className={styles.helps}>{product.helps}</p>
          <ul className={styles.for} aria-label="Good for">
            {product.forWho.map((f) => <li key={f}><Icon name="check" size={14} /> {f}</li>)}
          </ul>
          <div className={styles.buy}>
            <PriceTag priceCents={product.priceCents} size="lg" />
            <p className={styles.counts}>
              <span className="num">{productCategoryCount(product)}</span> areas of health · <span className="num">{productMarkerCount(product)}</span> markers
            </p>
            <div className={styles.actions}>
              <Button href={`/checkout/${product.slug}`} ctaId={`choose_${product.slug}`} location="product_hero">
                Choose {product.shortName} <Icon name="arrow" size={18} />
              </Button>
              <Button href="/tests" variant="outline" ctaId="product_compare" location="product_hero">Compare tests</Button>
            </div>
          </div>
        </div>
        <Photo asset={productHeroMedia[product.tier]} priority sizes="(min-width: 64rem) 42vw, 100vw" className={styles.photo} position="center 30%" />
      </Container>
    </section>
  );
}
