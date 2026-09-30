import { activeRetestOffer } from "@/config/retest-offer";
import { cx } from "@/lib/cx";
import styles from "./SignalCard.module.css";

/**
 * Floating "Your signal" card laid over photography. Shows markers tracked
 * across three tests — the Test → Retest idea at a glance.
 * Illustrative only: no values, ranges or outcomes.
 */
const ROWS: { label: string; points: [number, number, number] }[] = [
  { label: "Ferritin", points: [0.3, 0.42, 0.66] },
  { label: "LDL", points: [0.72, 0.55, 0.42] },
  { label: "HbA1c", points: [0.7, 0.58, 0.5] },
];
const W = 120;
const H = 28;
const X = [4, W / 2, W - 4];
const y = (v: number) => H - 4 - v * (H - 8);

export function SignalCard({ className }: { className?: string }) {
  const months = activeRetestOffer()?.intervalMonths ?? 6;
  return (
    <figure className={cx(styles.card, className)} aria-label="Illustration: three blood markers tracked across three tests">
      <div className={styles.head}>
        <span className={styles.title}>Your signal</span>
        <span className={styles.note}>Example</span>
      </div>
      <ul className={styles.rows}>
        {ROWS.map((r, i) => (
          <li key={r.label} className={styles.row} style={{ ["--i" as string]: i }}>
            <span className={styles.label}>{r.label}</span>
            <span className={styles.plot} aria-hidden="true">
              <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className={styles.spark}>
                <polyline points={r.points.map((v, j) => `${X[j]},${y(v)}`).join(" ")} />
              </svg>
              {r.points.map((v, j) => (
                <span key={j} className={j === 2 ? styles.latest : styles.dot}
                  style={{ left: `${(X[j]! / W) * 100}%`, top: `${(y(v) / H) * 100}%` }} />
              ))}
            </span>
          </li>
        ))}
      </ul>
      <figcaption className={styles.caption}>Retested every {months} months</figcaption>
    </figure>
  );
}
