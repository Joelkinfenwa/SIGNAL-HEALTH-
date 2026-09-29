import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { media } from "@/config/media";
import { activeRetestOffer } from "@/config/retest-offer";
import { Photo } from "./Photo";
import styles from "./RetestBand.module.css";

/** Introduces retesting as an idea. No pricing here — the offer appears after purchase. */
export function RetestBand() {
  const interval = activeRetestOffer()?.intervalMonths ?? 6;
  const points = ["Today", `${interval} months`, `${interval * 2} months`, `${interval * 3} months`];
  return (
    <section id="retesting" data-theme="light" className={styles.section} aria-labelledby="retest-title">
      <Container>
        <div className={styles.band}>
          <Photo asset={media.couple} sizes="(min-width: 76rem) 76rem, 100vw" className={styles.photo} position="center 35%" />
          <div className={styles.copy}>
            <h2 id="retest-title" className={styles.title}>Your health isn&apos;t a snapshot.</h2>
            <p className={styles.body}>
              One result shows where you are today. Testing again over time shows which way you&apos;re heading,
              and whether the changes you make are working.
            </p>
            <ol className={styles.timeline} aria-label={`Example schedule, every ${interval} months`}>
              {points.map((p, i) => (
                <li key={p} className={i === 0 ? styles.now : undefined}>{p}</li>
              ))}
            </ol>
            <Link href="/retesting" className={styles.link}>How Automatic Retesting works</Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
