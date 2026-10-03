import { Icon } from "@/components/ui/Icon";
import { Section, SectionHeader } from "@/components/ui/Section";
import { sellableAddonsFor } from "@/config/addons";
import { biomarkers, biomarkerCategories } from "@/config/biomarkers";
import { signalTest } from "@/config/products";
import { fillHomeTokens } from "@/lib/home-tokens";
import styles from "./Biomarkers.module.css";


/**
 * Expandable category cards driven by the biomarker catalogue and the product:
 * counts and examples are derived, never typed in. <details>: no JavaScript.
 * Areas covered only by an add-on (e.g. Hormones, Nutrients) are shown too,
 * clearly tagged, so nobody assumes they are in the base test.
 */
export function Biomarkers() {
  const base = new Set(signalTest.markerIds);
  const addonByMarker = new Map<string, string>();
  for (const a of sellableAddonsFor()) for (const m of a.markerIds) if (!base.has(m)) addonByMarker.set(m, a.name);
  return (
    <Section id="what-is-tested" theme="light" labelledBy="biomarkers-title">
      <SectionHeader
        id="biomarkers-title"
        eyebrow="What SIGNAL measures"
        title="One sample. The major areas of your health."
        intro={fillHomeTokens("{areas} areas of health and {markers} markers in every SIGNAL Test, each explained in plain language. Go deeper with optional add-ons. Tap an area to see what's measured.")}
      />
      <ul className={styles.grid}>
        {biomarkerCategories.map((c) => {
          const inBase = biomarkers.filter((m) => m.category === c.id && base.has(m.id));
          const inAddons = biomarkers.filter((m) => m.category === c.id && addonByMarker.has(m.id));
          if (inBase.length === 0 && inAddons.length === 0) return null;
          const addonOnly = inBase.length === 0;
          const ms = addonOnly ? inAddons : inBase;
          const extra = Array.from(new Set(inAddons.map((m) => addonByMarker.get(m.id)!)));
          const label = addonOnly ? `Add-on: ${extra.join(", ")}` : extra.length ? `Go deeper with ${extra.join(", ")}` : "Included in every SIGNAL";
          return (
            <li key={c.id}>
              <details className={addonOnly ? `${styles.card} ${styles.cardAddon}` : styles.card}>
                <summary className={styles.summary}>
                  <span className={styles.summaryText}>
                    <span className={styles.name}>{c.name}</span>
                    <span className={styles.count}><span className="num">{ms.length}</span> {ms.length === 1 ? "marker" : "markers"}{addonOnly ? <span className={styles.countTag}> · add-on</span> : null}</span>
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
