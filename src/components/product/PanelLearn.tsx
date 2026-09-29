import { groupByCategory, type BiomarkerCategoryId } from "@/config/biomarkers";
import { cx } from "@/lib/cx";
import styles from "./PanelLearn.module.css";

interface PanelLearnProps {
  /** Marker ids in the panel. */
  markers: readonly string[];
  /** Restrict to these categories (compact card use). */
  only?: readonly BiomarkerCategoryId[];
  /** Max markers per category before "+N more". */
  limit?: number;
  variant?: "compact" | "full";
  /** Marker ids to visually mark as newly added (compare presentations). */
  highlight?: readonly string[];
  className?: string;
}

/**
 * "Sell what they're learning": markers grouped under the area of health they
 * describe, so a panel reads as understanding rather than line items.
 * Calculated markers are tagged — they're derived from results already paid for.
 */
export function PanelLearn({ markers, only, limit, variant = "full", highlight, className }: PanelLearnProps) {
  const groups = groupByCategory(markers).filter((g) => !only || only.includes(g.category.id));
  const hl = new Set(highlight ?? []);
  return (
    <ul className={cx(styles.list, styles[variant], className)}>
      {groups.map(({ category, markers: ms }) => {
        const shown = limit ? ms.slice(0, limit) : ms;
        const more = ms.length - shown.length;
        return (
          <li key={category.id} className={styles.group}>
            <div className={styles.head}>
              <span className={styles.category}>{category.name}</span>
              {variant === "full" ? <p className={styles.learn}>{category.learn}</p> : null}
            </div>
            <ul className={styles.markers}>
              {shown.map((m) => (
                <li key={m.id} className={cx(styles.marker, m.derivedFrom && styles.derived, hl.has(m.id) && styles.added)} title={variant === "full" ? m.about : undefined}>
                  {variant === "full" ? m.name : (m.short ?? m.name)}
                  {m.derivedFrom && variant === "full" ? <span className={styles.calc}>calculated</span> : null}
                </li>
              ))}
              {more > 0 ? <li className={styles.more}>+{more} more</li> : null}
            </ul>
          </li>
        );
      })}
    </ul>
  );
}
