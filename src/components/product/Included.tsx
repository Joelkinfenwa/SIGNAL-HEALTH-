import { Icon } from "@/components/ui/Icon";
import { Section, SectionHeader } from "@/components/ui/Section";
import { everyTestIncludes } from "@/config/offer";
import styles from "./Included.module.css";

/** "Every test includes": the offer itself, independent of which panel. */
export function Included({ theme = "light" }: { theme?: "light" | "shell" }) {
  return (
    <Section id="included" theme={theme} labelledBy="included-title">
      <SectionHeader id="included-title" eyebrow="What's included" title="Every test, start to finish." intro="The price of a test covers the whole experience, not just the lab work." />
      <ul className={styles.grid}>
        {everyTestIncludes.map((i) => (
          <li key={i.id} className={styles.item}>
            <span className={styles.icon}><Icon name={i.icon} size={20} /></span>
            <span>
              <strong className={styles.title}>{i.title}</strong>
              <span className={styles.body}>{i.body}</span>
            </span>
          </li>
        ))}
      </ul>
    </Section>
  );
}
