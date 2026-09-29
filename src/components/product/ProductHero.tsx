import Link from "next/link";
import { Photo } from "@/components/home/Photo";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { media, productHeroMedia, productHeroWide } from "@/config/media";
import { productCategoryCount, productMarkerCount, type Product } from "@/config/products";
import { activeRetestOffers } from "@/config/retest-offer";
import { BuyBox } from "./BuyBox";
import styles from "./ProductHero.module.css";

/** Classic product page top: images left, name, description, facts and buy box right. */
export function ProductHero({ product }: { product: Product }) {
  const main = productHeroWide[product.tier] ?? productHeroMedia[product.tier];
  return (
    <section id="hero" data-theme="light" className={styles.section} aria-labelledby="product-title">
      <Container className={styles.inner}>
        <div className={styles.gallery}>
          <Photo asset={main} priority sizes="(min-width: 64rem) 55vw, 100vw" className={styles.main} position="60% 40%" />
          <div className={styles.thumbs}>
            <Photo asset={media.tubes} sizes="(min-width: 64rem) 27vw, 50vw" className={styles.thumb} position="center 60%" />
            <Photo asset={media.homeVisit} sizes="(min-width: 64rem) 27vw, 50vw" className={styles.thumb} position="center 40%" />
          </div>
        </div>

        <div className={styles.details}>
          <nav aria-label="Breadcrumb" className={styles.crumbs}>
            <Link href="/tests">Tests</Link><span aria-hidden="true"> / </span><span>{product.shortName}</span>
          </nav>
          <h1 id="product-title" className={styles.title}>
            {product.name}
            {product.featured ? <span className={styles.badge}>Recommended</span> : null}
          </h1>
          <p className={styles.tagline}>{product.tagline}</p>
          <p className={styles.desc}>{product.promise}</p>
          <ul className={styles.facts}>
            <li><Icon name="chart" size={16} /> <span className="num">{productCategoryCount(product)}</span> areas of health, <span className="num">{productMarkerCount(product)}</span> markers</li>
            <li><Icon name="home" size={16} /> Collected at home or nearby</li>
            <li><Icon name="shield" size={16} /> Clinical review included</li>
            <li><Icon name="chat" size={16} /> Every marker explained in plain language</li>
          </ul>
          <BuyBox slug={product.slug} shortName={product.shortName} priceCents={product.priceCents} offers={activeRetestOffers()} />
          <p className={styles.compare}><Link href="/tests">Compare all five tests</Link></p>
        </div>
      </Container>
    </section>
  );
}
