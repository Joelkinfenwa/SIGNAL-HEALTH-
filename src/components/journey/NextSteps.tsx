import { Section, SectionHeader } from "@/components/ui/Section";
import { journey, showTimingPlaceholders } from "@/config/journey";
import { cx } from "@/lib/cx";
import styles from "./NextSteps.module.css";

interface NextStepsProps {
  /** Which step the reader is at; earlier steps render as done. */
  current?: string;
  /** Limit to these step ids (checkout shows the three after payment). */
  only?: string[];
  title?: string;
  intro?: string;
  theme?: "light" | "shell";
  /** Render without the Section wrapper (inside another layout). */
  bare?: boolean;
  /** "columns" lays steps side by side on desktop (the /signal section); "list" keeps a vertical timeline (checkout, order). */
  layout?: "columns" | "list";
}

/** "What happens next": a plain timeline. Placeholder timings show on previews only. */
export function NextSteps({ current, only, title = "What happens next", intro, theme = "shell", bare, layout = bare ? "list" : "columns" }: NextStepsProps) {
  const steps = journey.filter((s) => !only || only.includes(s.id));
  const currentIndex = current ? journey.findIndex((s) => s.id === current) : -1;
  const list = (
    <ol className={cx(styles.steps, layout === "columns" && styles.columns)}>
      {steps.map((s) => {
        const idx = journey.findIndex((j) => j.id === s.id);
        const state = idx < currentIndex ? "done" : idx === currentIndex ? "now" : "next";
        const showTiming = s.timingStatus === "verified" || showTimingPlaceholders();
        return (
          <li key={s.id} className={cx(styles.step, styles[state])}>
            <span className={styles.marker} aria-hidden="true">{state === "done" ? "✓" : idx + 1}</span>
            <div className={styles.text}>
              <div className={styles.head}>
                <h3 className={styles.title}>{s.title}</h3>
                {showTiming ? <span className={cx(styles.timing, s.timingStatus === "placeholder" && styles.todo)}>{s.timing.replace(/^\[|\]$/g, "")}{s.timingStatus === "placeholder" ? " · to confirm" : ""}</span> : null}
              </div>
              <p className={styles.body}>{s.body}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
  if (bare) return list;
  return (
    <Section id="next-steps" theme={theme} labelledBy="next-title">
      <SectionHeader id="next-title" eyebrow="Next steps" title={title} intro={intro} />
      {list}
    </Section>
  );
}
