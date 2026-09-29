import { Section, SectionHeader } from "@/components/ui/Section";
import { Icon } from "@/components/ui/Icon";
import { derivedMarkers } from "@/config/biomarkers";
import { addedMarkers, getProductByTier, type Product } from "@/config/products";
import { PanelLearn } from "./PanelLearn";
import styles from "./ProductLearn.module.css";

/** "What you'll learn" for a product, plus the calculated-for-you and builds-on panels. */
export function ProductLearn({ product }: { product: Product }) {
  const derived = derivedMarkers(product.markers);
  const base = product.buildsOn ? getProductByTier(product.buildsOn) : undefined;
  const added = base ? addedMarkers(product) : [];
  return (
    <Section id="learn" theme="light" labelledBy="learn-title">
      <SectionHeader
        id="learn-title"
        eyebrow="What's measured"
        title={`What ${product.shortName} tells you.`}
        intro={product.outcome}
      />
      {product.audienceNote ? <p className={styles.note}><Icon name="sparkle" size={16} /> {product.audienceNote}</p> : null}
      <ul className={styles.forWho} aria-label="Good for">
        {product.whyYou.map((w) => <li key={w}><Icon name="check" size={16} /> {w}</li>)}
      </ul>
      <PanelLearn markers={product.markers} variant="full" highlight={added} />

      {derived.length > 0 ? (
        <aside className={styles.derived} aria-labelledby="derived-title">
          <h3 id="derived-title" className={styles.derivedTitle}>Calculated for you, at no extra cost</h3>
          <p className={styles.derivedBody}>
            Some of the most useful numbers don&apos;t need another test. Because {product.shortName} already measures the inputs, we calculate these for you.
          </p>
          <ul className={styles.derivedList}>
            {derived.map((m) => (
              <li key={m.id}><strong>{m.name}</strong><span>{m.about}</span></li>
            ))}
          </ul>
        </aside>
      ) : null}

      {base && added.length > 0 ? (
        <aside className={styles.builds} aria-labelledby="builds-title">
          <h3 id="builds-title" className={styles.buildsTitle}>Everything in {base.shortName}, plus {added.length} more</h3>
          <p className={styles.buildsBody}>The highlighted markers above are what {product.shortName} adds on top of {base.name}.</p>
        </aside>
      ) : null}
    </Section>
  );
}
