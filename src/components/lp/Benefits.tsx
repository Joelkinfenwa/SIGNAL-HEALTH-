import { Icon } from "@/components/ui/Icon";
import { Section, SectionHeader } from "@/components/ui/Section";
import styles from "./Benefits.module.css";

/** Three benefit cards for landing pages. Copy comes from the page config. */
export function Benefits({ title, items }: { title: string; items: { title: string; body: string }[] }) {
  if (items.length === 0) return null;
  return (
    <Section id="benefits" theme="light" labelledBy="benefits-title">
      <SectionHeader id="benefits-title" title={title} />
      <ul className={styles.grid}>
        {items.map((b) => (
          <li key={b.title} className={styles.card}>
            <span className={styles.icon}><Icon name="check" size={18} /></span>
            <h3 className={styles.title}>{b.title}</h3>
            <p className={styles.body}>{b.body}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
