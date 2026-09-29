import { Section, SectionHeader } from "@/components/ui/Section";
import { Icon, type IconName } from "@/components/ui/Icon";
import styles from "./HowItWorks.module.css";

const STEPS: { icon: IconName; title: string; body: string }[] = [
  { icon: "tube", title: "Choose your test", body: "Pick from three tests, or answer a few questions and we'll suggest one." },
  { icon: "home", title: "Get tested", body: "A collector comes to you where available, or visit a collection centre." },
  { icon: "chat", title: "Understand your numbers", body: "Results come with clinical review, explained in plain language." },
  { icon: "chart", title: "Track change", body: "Retest over time and see how your numbers move." },
];

export function HowItWorks() {
  return (
    <Section id="how-it-works" theme="light" labelledBy="how-title">
      <SectionHeader id="how-title" title="Simple from start to finish" intro="From choosing a test to tracking your progress." />
      <ol className={styles.steps}>
        {STEPS.map((s, i) => (
          <li key={s.title} className={styles.step}>
            <div className={styles.top}>
              <span className={styles.icon}><Icon name={s.icon} size={22} /></span>
              <span className={styles.index}>Step {i + 1}</span>
            </div>
            <h3 className={styles.title}>{s.title}</h3>
            <p className={styles.body}>{s.body}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
