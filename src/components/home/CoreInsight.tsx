import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { insight } from "@/config/home";
import styles from "./CoreInsight.module.css";

/** D. The insight that anchors Meta/UGC messaging: you measure everything except what's inside. */
export function CoreInsight() {
  return (
    <section id="insight" data-theme="dark" className={styles.section} aria-labelledby="insight-title">
      <Container className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>{insight.eyebrow}</p>
          <h2 id="insight-title" className={styles.title}>{insight.title}</h2>
          <p className={styles.body}>{insight.body}</p>
          <p className={styles.close}>{insight.close}</p>
          <div className={styles.action}>
            <Button href={insight.cta.href} variant="outline" ctaId="insight_see_measures" location="insight">{insight.cta.label} <Icon name="arrow" size={18} /></Button>
          </div>
        </div>
        <ul className={styles.tiles} aria-hidden="true">
          {insight.tracked.map((t) => (
            <li key={t.label} className={styles.tile}>
              <span className={styles.tileLabel}>{t.label}</span>
              <span className={styles.tileValue}>{t.value}</span>
            </li>
          ))}
          <li className={styles.tileSignal}>
            <span className={styles.tileLabel}>Inside</span>
            <span className={styles.tileQ}>?</span>
          </li>
        </ul>
      </Container>
    </section>
  );
}
