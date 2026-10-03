import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { media } from "@/config/media";
import { activeRetestOffer } from "@/config/retest-offer";
import { formatInterval } from "@/lib/retest/offer";
import { Photo } from "./Photo";
import styles from "./RetestBand.module.css";

/**
 * Introduces retesting as an idea. No pricing or discount here — the
 * Automatic Retesting offer appears after purchase.
 */
export function RetestBand() {
  const interval = activeRetestOffer()?.intervalMonths ?? 6;
  const points = ["Today", `${interval} months`, `${interval * 2} months`, `${interval * 3} months`];
  return (
    <section id="retesting" data-theme="light" className={styles.section} aria-labelledby="retest-title">
      <Container>
        <div className={styles.band}>
          <Photo asset={media.couple} sizes="(min-width: 76rem) 76rem, 100vw" className={styles.photo} position="center 35%" />
          <div className={styles.copy}>
            <p className={styles.eyebrow}>Retesting</p>
            <h2 id="retest-title" className={styles.title}>One test is a snapshot. Your SIGNAL changes.</h2>
            <p className={styles.body}>
              Measure. Understand. Retest. Every new SIGNAL is compared with your last, marker by marker, so you can see what
              changed over {formatInterval(interval)} and what didn&apos;t.
            </p>
            <ol className={styles.timeline} aria-label={`Example schedule, every ${formatInterval(interval)}`}>
              {points.map((p, i) => (
                <li key={p} className={i === 0 ? styles.now : undefined}>{p}</li>
              ))}
            </ol>
            <Link href="/retesting" className={styles.link}>How retesting works</Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
