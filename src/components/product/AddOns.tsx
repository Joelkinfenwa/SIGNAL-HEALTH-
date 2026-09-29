import { Section, SectionHeader } from "@/components/ui/Section";
import { addOns, addonsFor, type AddOn } from "@/config/addons";
import { getBiomarker } from "@/config/biomarkers";
import type { Product } from "@/config/products";
import styles from "./AddOns.module.css";

/**
 * Add-on bundles. On a product page only the add-ons that would add new
 * markers are shown. Marked as coming: no price, no booking yet.
 */
export function AddOns({ product, theme = "shell" }: { product?: Product; theme?: "light" | "shell" }) {
  const list: (AddOn & { newMarkers?: string[] })[] = product ? addonsFor(product) : addOns.filter((a) => a.status === "planned");
  if (list.length === 0) return null;
  return (
    <Section id="add-ons" theme={theme} labelledBy="addons-title">
      <SectionHeader
        id="addons-title"
        eyebrow="Add-ons"
        title={product ? `Go deeper with ${product.shortName}.` : "Go deeper, your way."}
        intro="Add a focused bundle to any test instead of paying for markers you don't need in every panel. Add-ons are coming; availability and pricing will be confirmed at launch."
      />
      <ul className={styles.grid}>
        {list.map((a) => (
          <li key={a.id} className={styles.card}>
            <div className={styles.head}>
              <h3 className={styles.name}>{a.name}</h3>
              <span className={styles.soon}>Coming</span>
            </div>
            <p className={styles.summary}>{a.summary}</p>
            <ul className={styles.markers}>
              {(a.newMarkers ?? a.markers).map((id) => {
                const m = getBiomarker(id);
                return <li key={id}>{m.short ?? m.name}</li>;
              })}
            </ul>
          </li>
        ))}
      </ul>
    </Section>
  );
}
