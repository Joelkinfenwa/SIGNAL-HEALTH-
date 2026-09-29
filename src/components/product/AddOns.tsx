import { Section, SectionHeader } from "@/components/ui/Section";
import { addonNewMarkers, addonsFor } from "@/config/addons";
import { getBiomarker } from "@/config/biomarkers";
import styles from "./AddOns.module.css";

/**
 * "Make it yours": the add-ons as depth on top of the base test. Display only;
 * the configurator on /signal does the selecting.
 */
export function AddOns({ theme = "shell" }: { theme?: "light" | "shell" }) {
  const list = addonsFor();
  if (list.length === 0) return null;
  return (
    <Section id="add-ons" theme={theme} labelledBy="addons-title">
      <SectionHeader
        id="addons-title"
        eyebrow="Make it yours"
        title="Go deeper where it matters to you."
        intro="The SIGNAL Test already covers the major areas. Add depth only where you want it. Availability and pricing are confirmed at launch."
      />
      <ul className={styles.grid}>
        {list.map((a) => (
          <li key={a.id} className={styles.card}>
            <div className={styles.head}>
              <h3 className={styles.name}>{a.name}</h3>
              {a.status !== "live" ? <span className={styles.soon}>Coming</span> : null}
            </div>
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
