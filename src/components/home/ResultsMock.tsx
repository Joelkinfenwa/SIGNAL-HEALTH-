import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { resultsMock } from "@/config/home";
import styles from "./ResultsMock.module.css";

/**
 * "Results you understand": a phone-style dashboard mock.
 * Clearly illustrative — labelled as an example, no real ranges or advice.
 * Scroll reveal uses CSS scroll-driven animation (no JS); reduced motion disables it.
 */
export function ResultsMock() {
  const r = resultsMock;
  return (
    <section id="results" data-theme="light" className={styles.section} aria-labelledby="results-title">
      <Container className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>Results you understand</p>
          <h2 id="results-title" className={styles.title}>Numbers, explained like a person would.</h2>
          <p className={styles.body}>
            Every marker comes with a plain-language explanation, where it sits, and how it has changed since your last test. Clinical review is included.
          </p>
          <ul className={styles.points}>
            <li><span className={styles.tick}><Icon name="check" size={16} /></span>Each marker explained simply</li>
            <li><span className={styles.tick}><Icon name="check" size={16} /></span>Change since your last test, at a glance</li>
            <li><span className={styles.tick}><Icon name="check" size={16} /></span>Clinical review included</li>
          </ul>
          <div className={styles.action}>
            <Button href="/find-my-test" ctaId="results_find_my_test" location="results">Find my test</Button>
          </div>
        </div>

        <figure className={styles.phoneWrap} aria-label="Illustrative example of a result in the SIGNAL dashboard">
          <div className={styles.phone}>
            <div className={styles.screen}>
              <div className={styles.appBar}>
                <span className={styles.appTitle}>Your signal</span>
                <span className={styles.example}>Example</span>
              </div>
              <div className={styles.markerCard}>
                <span className={styles.markerName}>{r.marker}</span>
                <span className={styles.markerValue}>
                  <span className="num">{r.value}</span> <small>{r.unit}</small>
                </span>
                <span className={styles.status}><Icon name="check" size={14} /> {r.status}</span>
                <span className={styles.change}>
                  <Icon name={r.change.direction === "up" ? "trendUp" : "chart"} size={16} /> {r.change.label}
                </span>
              </div>
              <div className={styles.explain}>
                <span className={styles.explainLabel}>What this means</span>
                <p>{r.explanation}</p>
              </div>
              <div className={styles.history}>
                <span className={styles.historyLabel}>{r.previousLabel}</span>
                <span className={styles.historyBar}><span className={styles.historyPrev} /><span className={styles.historyNow} /></span>
                <span className={styles.historyLabel}>{r.currentLabel}</span>
              </div>
            </div>
          </div>
          <figcaption className={styles.caption}>Illustrative example only. Not a real result.</figcaption>
        </figure>
      </Container>
    </section>
  );
}
