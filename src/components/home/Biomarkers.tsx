import { Section, SectionHeader } from "@/components/ui/Section";
import { biomarkerCategories } from "@/config/biomarkers";
import { products } from "@/config/products";
import styles from "./Biomarkers.module.css";

/** Which tests include a category, phrased for people rather than as a matrix. */
function coverageLabel(categoryId: string): string {
  const incl = products.filter((p) => (p.categories as string[]).includes(categoryId));
  if (incl.length === products.length) return "In every test";
  if (incl.length === 1) return `${incl[0]!.shortName} only`;
  return incl.map((p) => p.shortName).join(" and ");
}

export function Biomarkers() {
  return (
    <Section id="biomarkers" theme="light" labelledBy="biomarkers-title">
      <SectionHeader id="biomarkers-title" title="What your blood can tell you"
        intro="One sample, a clear picture of how your body is working. Here's what SIGNAL looks at." />
      <ul className={styles.grid}>
        {biomarkerCategories.map((c) => {
          const label = coverageLabel(c.id);
          return (
            <li key={c.id} className={styles.tile}>
              <h3 className={styles.name}>{c.name}</h3>
              <p className={styles.desc}>{c.description}</p>
              <span className={label === "In every test" ? styles.tagAll : styles.tag}>{label}</span>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
