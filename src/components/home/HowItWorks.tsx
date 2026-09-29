import { Section, SectionHeader } from "@/components/ui/Section";
import { steps } from "@/config/home";
import { fillHomeTokens } from "@/lib/home-tokens";
import { StepMock } from "./StepMock";
import styles from "./HowItWorks.module.css";

/** Four numbered steps. Retesting is the final step, not an add-on. */
export function HowItWorks() {
  return (
    <Section id="how-it-works" theme="light" labelledBy="how-title">
      <SectionHeader
        id="how-title"
        eyebrow="How it works"
        title="Simple from the first test to the next."
        intro="Choose, get tested, understand your results, then retest to see what's changed."
      />
      <ol className={styles.steps}>
        {steps.map((s, i) => (
          <li key={s.id} className={styles.step}>
            <div className={styles.visual}><StepMock step={s.id} /></div>
            <div className={styles.text}>
              <span className={styles.index}><span className="num">{String(i + 1).padStart(2, "0")}</span> {s.label}</span>
              <h3 className={styles.title}>{s.title}</h3>
              <p className={styles.body}>{fillHomeTokens(s.body)}</p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
