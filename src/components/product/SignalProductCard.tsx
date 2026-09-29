import { Photo } from "@/components/home/Photo";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { PriceTag } from "@/components/product/PriceTag";
import { collectionMethods } from "@/config/collection";
import { signalMedia } from "@/config/media";
import { productCategories, productMarkerCount, signalTest } from "@/config/products";
import styles from "./SignalProductCard.module.css";

/** F. The product: one card, one CTA. Feels like buying a product, not filling a pathology form. */
export function SignalProductCard() {
  const p = signalTest;
  const areas = productCategories(p);
  const collection = collectionMethods.filter((c) => p.collectionMethodIds.includes(c.id));
  return (
    <section id="product" data-theme="shell" className={styles.section} aria-labelledby="product-title">
      <Container className={styles.card}>
        <Photo asset={signalMedia.hero} sizes="(min-width: 64rem) 50vw, 100vw" className={styles.photo} position="60% 40%" />
        <div className={styles.body}>
          <p className={styles.kicker}>The product</p>
          <h2 id="product-title" className={styles.title}>{p.name}</h2>
          <p className={styles.tagline}>{p.tagline}</p>
          <dl className={styles.facts}>
            <div><dt>Covers</dt><dd><span className="num">{areas.length}</span> areas of health · <span className="num">{productMarkerCount(p)}</span> markers</dd></div>
            <div><dt>Collection</dt><dd>{collection.map((c, i) => (i === 0 ? c.short : c.short.charAt(0).toLowerCase() + c.short.slice(1))).join(" or ")}</dd></div>
            <div><dt>Results</dt><dd>Reviewed, returned digitally, explained</dd></div>
            <div><dt>Add-ons</dt><dd>Go deeper where it matters to you</dd></div>
          </dl>
          <ul className={styles.areas} aria-label="Areas of health">
            {areas.map((c) => <li key={c.id}>{c.name}</li>)}
          </ul>
          <div className={styles.buy}>
            <PriceTag priceCents={p.priceCents} size="lg" />
            <Button href="/signal" ctaId="product_get_my_signal" location="product">Get my SIGNAL <Icon name="arrow" size={18} /></Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
