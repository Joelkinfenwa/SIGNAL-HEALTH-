import { Section, SectionHeader } from "@/components/ui/Section";
import { steps } from "@/config/home";
import { fillHomeTokens } from "@/lib/home-tokens";
import styles from "./ProductSteps.module.css";

/** Compact, text-only how-it-works for product pages. */
export function ProductSteps() {
  return (
    <Section id="how-it-works" theme="shell" labelledBy="steps-title">
      <SectionHeader id="steps-title" eyebrow="How it works" title="From order to answers." />
      <ol className={styles.steps}>
        {steps.map((s, i) => (
          <li key={s.id} className={styles.step}>
            <span className={styles.index}><span className="num">{i + 1}</span></span>
            <h3 className={styles.title}>{s.title}</h3>
            <p className={styles.body}>{fillHomeTokens(s.body)}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
