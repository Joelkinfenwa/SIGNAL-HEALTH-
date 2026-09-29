import { Section, SectionHeader } from "@/components/ui/Section";
import { addonNewMarkers, addonsFor } from "@/config/addons";
import { getBiomarker } from "@/config/biomarkers";
import styles from "./AddOns.module.css";

/**
 * "Make it yours": the add-ons as depth on top of the base test. Display only;
 * the configurator on /signal does the selecting.
 */
export function AddOns({ theme = "shell", highlightIds = [] }: { theme?: "light" | "shell"; highlightIds?: string[] }) {
  const list = addonsFor();
  const hl = new Set(highlightIds);
  if (list.length === 0) return null;
  return (
    <Section id="add-ons" theme={theme} labelledBy="addons-title">
      <SectionHeader
        id="addons-title"
        eyebrow="Make it yours"
        title="Go deeper where it matters to you."
        intro="The SIGNAL Test already covers the major areas. Add-ons are optional depth, never missing essentials. Availability and pricing are confirmed at launch."
      />
      <ul className={styles.grid}>
        {list.map((a) => (
          <li key={a.id} className={hl.has(a.id) ? `${styles.card} ${styles.highlight}` : styles.card}>
            <div className={styles.head}>
              <h3 className={styles.name}>{a.name}</h3>
              {hl.has(a.id) ? <span className={styles.rec}>Recommended</span> : a.status !== "live" ? <span className={styles.soon}>Coming</span> : null}
            </div>
            <p className={styles.summary}><strong>For you if</strong> {a.forWho}</p>
            <p className={styles.summary}>{a.benefit}</p>
            <ul className={styles.markers}>
              {addonNewMarkers(a).map((id) => { const m = getBiomarker(id); return <li key={id}>{m.short ?? m.name}</li>; })}
            </ul>
          </li>
        ))}
      </ul>
    </Section>
  );
}
