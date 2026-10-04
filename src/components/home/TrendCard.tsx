import { Icon } from "@/components/ui/Icon";
import { cx } from "@/lib/cx";
import styles from "./TrendCard.module.css";

export interface TrendCardProps {
  name: string;
  unit: string;
  previous: string;
  current: string;
  direction: "up" | "down" | "flat";
  note?: string;
  className?: string;
}

/**
 * One marker, previous → current. Presentation only: no ranges, no judgement
 * of good or bad. Reused by the marketing preview and, later, the dashboard.
 */
export function TrendCard({ name, unit, previous, current, direction, note, className }: TrendCardProps) {
  return (
    <div className={cx(styles.card, className)}>
      <span className={styles.name}>{name}</span>
      <span className={styles.values}>
        <span className={styles.prev}><span className="num">{previous}</span></span>
        <Icon name="arrow" size={16} className={styles.arrow} />
        <span className={styles.now}><span className="num">{current}</span> <small>{unit}</small></span>
      </span>
      {note ? (
        <span className={cx(styles.note, direction === "up" && styles.up, direction === "down" && styles.down)}>
          <Icon name={direction === "flat" ? "minus" : "trendUp"} size={14} className={direction === "down" ? styles.flip : undefined} /> {note}
        </span>
      ) : null}
    </div>
  );
}
