import { Icon } from "@/components/ui/Icon";
import { Section, SectionHeader } from "@/components/ui/Section";
import { biomarkerCategories } from "@/config/biomarkers";
import { products } from "@/config/products";
import { fillHomeTokens } from "@/lib/home-tokens";
import styles from "./Biomarkers.module.css";

/** Which tests include a category, phrased for people rather than as a matrix. */
function coverageLabel(categoryId: string): string {
  const incl = products.filter((p) => (p.categories as string[]).includes(categoryId));
  if (incl.length === products.length) return "In every test";
  if (incl.length === 1) return `${incl[0]!.shortName} only`;
  return incl.map((p) => p.shortName).join(" and ");
}

/**
 * Expandable category cards using <details>/<summary>: no JavaScript.
 * Marker names only — areas of measurement, never conditions or outcomes.
 */
export function Biomarkers() {
  return (
    <Section id="biomarkers" theme="light" labelledBy="biomarkers-title">
      <SectionHeader
        id="biomarkers-title"
        eyebrow="What we measure"
        title="One sample. A clear picture of how your body is working."
        intro={fillHomeTokens("{areas} areas of health, with the markers explained in plain language. Tap a category to see examples.")}
      />
      <ul className={styles.grid}>
        {biomarkerCategories.map((c) => {
          const label = coverageLabel(c.id);
          return (
            <li key={c.id}>
              <details className={styles.card}>
                <summary className={styles.summary}>
                  <span className={styles.summaryText}>
                    <span className={styles.name}>{c.name}</span>
                    <span className={styles.count}><span className="num">{c.count}</span> markers</span>
                  </span>
                  <span className={styles.toggle} aria-hidden="true">
                    <Icon name="plus" size={18} className={styles.plus} />
                    <Icon name="minus" size={18} className={styles.minus} />
                  </span>
                </summary>
                <div className={styles.body}>
                  <p className={styles.desc}>{c.description}</p>
                  <ul className={styles.examples}>
                    {c.examples.map((m) => <li key={m}>{m}</li>)}
                  </ul>
                  <span className={label === "In every test" ? styles.tagAll : styles.tag}>{label}</span>
                </div>
              </details>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
