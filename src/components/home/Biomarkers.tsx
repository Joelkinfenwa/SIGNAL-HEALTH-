import { Icon } from "@/components/ui/Icon";
import { Section, SectionHeader } from "@/components/ui/Section";
import { addonsFor } from "@/config/addons";
import { biomarkers, biomarkerCategories } from "@/config/biomarkers";
import { signalTest } from "@/config/products";
import { fillHomeTokens } from "@/lib/home-tokens";
import styles from "./Biomarkers.module.css";


/**
 * Expandable category cards driven by the biomarker catalogue and the panels:
 * counts and examples are derived, never typed in. <details>: no JavaScript.
 */
export function Biomarkers() {
  const base = new Set(signalTest.markerIds);
  const addonByMarker = new Map<string, string>();
  for (const a of addonsFor()) for (const m of a.markerIds) if (!base.has(m)) addonByMarker.set(m, a.name);
  return (
    <Section id="what-is-tested" theme="light" labelledBy="biomarkers-title">
      <SectionHeader
        id="biomarkers-title"
        eyebrow="What SIGNAL measures"
        title="One sample. The major areas of your health."
        intro={fillHomeTokens("{areas} areas of health and {markers} markers in every SIGNAL Test, each explained in plain language. Tap an area to see what's measured.")}
      />
      <ul className={styles.grid}>
        {biomarkerCategories.map((c) => {
          const ms = biomarkers.filter((m) => m.category === c.id && base.has(m.id));
          if (ms.length === 0) return null;
          const extra = Array.from(new Set(biomarkers.filter((m) => m.category === c.id && addonByMarker.has(m.id)).map((m) => addonByMarker.get(m.id)!)));
          const label = extra.length ? `Go deeper with ${extra.join(", ")}` : "Included in every SIGNAL";
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
                  <span className={extra.length ? styles.tag : styles.tagAll}>{label}</span>
                </div>
              </details>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
