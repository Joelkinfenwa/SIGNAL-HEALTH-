import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { ReportCard } from "./ReportCard";
import styles from "./ResultsMock.module.css";

/**
 * I. Your results: what the written report is, in words. No invented
 * values and nothing that looks like an app or a dashboard.
 */
export function ResultsMock() {
  return (
    <section id="why-signal" data-theme="light" className={styles.section} aria-labelledby="results-title">
      <Container className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>Your results</p>
          <h2 id="results-title" className={styles.title}>Every marker explained. Nothing to decode.</h2>
          <p className={styles.body}>
            An Australian-registered doctor reads your full picture and writes a plain-English explanation of where each marker sits and what it means for you. In your inbox within 5 days of collection.
          </p>
          <ul className={styles.points}>
            <li><span className={styles.tick}><Icon name="check" size={16} /></span>Each marker explained, no decoding a lab report</li>
            <li><span className={styles.tick}><Icon name="check" size={16} /></span>Anything outside range flagged, with whether to see your GP</li>
            <li><span className={styles.tick}><Icon name="check" size={16} /></span>Sent as a secure link, yours to keep</li>
          </ul>
          <div className={styles.action}>
            <Button href="/signal" ctaId="results_get_my_signal" location="results">Get my SIGNAL</Button>
          </div>
        </div>
        <div className={styles.cardWrap}><ReportCard /></div>
      </Container>
    </section>
  );
}
