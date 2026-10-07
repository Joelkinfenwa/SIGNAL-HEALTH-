import { Icon } from "@/components/ui/Icon";
import { reportCard } from "@/config/report";
import { cx } from "@/lib/cx";
import styles from "./ReportCard.module.css";

/** Describes the written report in words. No invented results, nothing that looks like a dashboard. */
export function ReportCard({ className }: { className?: string }) {
  return (
    <div className={cx(styles.card, className)}>
      <p className={styles.eyebrow}>{reportCard.eyebrow}</p>
      <p className={styles.title}>{reportCard.title}</p>
      <ul className={styles.rows}>
        {reportCard.rows.map((r) => <li key={r}><span className={styles.tick}><Icon name="check" size={14} /></span><span>{r}</span></li>)}
      </ul>
      <p className={styles.foot}>{reportCard.foot}</p>
    </div>
  );
}
