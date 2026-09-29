import { Icon } from "@/components/ui/Icon";
import { Section, SectionHeader } from "@/components/ui/Section";
import { biomarkers, biomarkerCategories } from "@/config/biomarkers";
import { allPanelMarkers, products, productsWithCategory } from "@/config/products";
import { fillHomeTokens } from "@/lib/home-tokens";
import styles from "./Biomarkers.module.css";

/** Which tests include a category, phrased for people rather than as a matrix. */
function coverageLabel(incl: { shortName: string }[]): string {
  if (incl.length === products.length) return "In every test";
  if (incl.length === 1) return `${incl[0]!.shortName} only`;
  return incl.map((p) => p.shortName).join(", ").replace(/, ([^,]*)$/, " and $1");
}

/**
 * Expandable category cards driven by the biomarker catalogue and the panels:
 * counts and examples are derived, never typed in. <details>: no JavaScript.
 */
export function Biomarkers() {
  const inPanels = new Set(allPanelMarkers());
  return (
    <Section id="biomarkers" theme="light" labelledBy="biomarkers-title">
      <SectionHeader
        id="biomarkers-title"
        eyebrow="What you'll learn"
        title="One sample. A clear picture of how your body is working."
        intro={fillHomeTokens("{areas} areas of health, {markers} markers across the range, every one explained in plain language. Tap an area to see what's measured.")}
      />
      <ul className={styles.grid}>
        {biomarkerCategories.map((c) => {
          const ms = biomarkers.filter((m) => m.category === c.id && inPanels.has(m.id));
          if (ms.length === 0) return null;
          const label = coverageLabel(productsWithCategory(c.id));
          return (
            <li key={c.id}>
              <details className={styles.card}>
                <summary className={styles.summary}>
                  <span className={styles.summaryText}>
                    <span className={styles.name}>{c.name}</span>
                    <span className={styles.count}><span className="num">{ms.length}</span> {ms.length === 1 ? "marker" : "markers"}</span>
                  </span>
                  <span className={styles.toggle} aria-hidden="true">
                    <Icon name="plus" size={18} className={styles.plus} />
                    <Icon name="minus" size={18} className={styles.minus} />
                  </span>
                </summary>
                <div className={styles.body}>
                  <p className={styles.desc}>{c.learn}</p>
                  <ul className={styles.examples}>
                    {ms.map((m) => <li key={m.id} className={m.derivedFrom ? styles.derived : undefined}>{m.name}</li>)}
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
