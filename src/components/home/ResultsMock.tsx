import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { getBiomarker } from "@/config/biomarkers";
import { resultsPreview } from "@/config/home";
import { TrendCard } from "./TrendCard";
import styles from "./ResultsMock.module.css";

/**
 * I. Results experience preview: a phone-style "Your SIGNAL" with three
 * markers, previous → current. Illustrative only; labelled as an example.
 * TrendCard is reusable for the real dashboard later.
 */
export function ResultsMock() {
  const r = resultsPreview;
  return (
    <section id="why-signal" data-theme="light" className={styles.section} aria-labelledby="results-title">
      <Container className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>Your results</p>
          <h2 id="results-title" className={styles.title}>Numbers you can read. Change you can see.</h2>
          <p className={styles.body}>
            Every marker explained in plain language, with where it sits and how it has moved since your last SIGNAL. Reviewed before you see it.
          </p>
          <ul className={styles.points}>
            <li><span className={styles.tick}><Icon name="check" size={16} /></span>Each marker explained, no decoding a lab report</li>
            <li><span className={styles.tick}><Icon name="check" size={16} /></span>Previous and current side by side</li>
            <li><span className={styles.tick}><Icon name="check" size={16} /></span>Returned digitally, reviewed</li>
          </ul>
          <div className={styles.action}>
            <Button href="/signal" ctaId="results_get_my_signal" location="results">Get my SIGNAL</Button>
          </div>
        </div>

        <figure className={styles.phoneWrap} aria-label="Illustrative example of a SIGNAL results report">
          <div className={styles.phone}>
            <div className={styles.screen}>
              <div className={styles.appBar}>
                <span className={styles.appTitle}>Your SIGNAL</span>
                <span className={styles.example}>Example</span>
              </div>
              <p className={styles.period}>{r.previousLabel} → {r.currentLabel}</p>
              <div className={styles.cards}>
                {r.markers.map((m) => (
                  <TrendCard key={m.markerId} name={getBiomarker(m.markerId).name} unit={m.unit} previous={m.previous} current={m.current} direction={m.direction} note={m.note} />
                ))}
              </div>
            </div>
          </div>
          <figcaption className={styles.caption}>Illustrative example only. Not real results.</figcaption>
        </figure>
      </Container>
    </section>
  );
}
