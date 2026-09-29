import { Icon } from "@/components/ui/Icon";
import { groupByCategory } from "@/config/biomarkers";
import { cx } from "@/lib/cx";
import styles from "./MarkerAreas.module.css";

/**
 * "What's tested", made readable: one card per area of health with a plain
 * sentence on what it tells you, the marker count, the marker names at a
 * readable size, and a native <details> that opens the one-line explanation
 * of every marker. Calculated markers are marked with a small dot; the legend
 * explains it once.
 */
export function MarkerAreas({ markers, className }: { markers: readonly string[]; className?: string }) {
  const groups = groupByCategory(markers);
  const hasDerived = groups.some((g) => g.markers.some((m) => m.derivedFrom));
  return (
    <div className={cx(styles.wrap, className)}>
      <ul className={styles.grid}>
        {groups.map(({ category, markers: ms }) => (
          <li key={category.id} className={styles.card}>
            <div className={styles.head}>
              <h3 className={styles.name}>{category.name}</h3>
              <span className={styles.count}><span className="num">{ms.length}</span> {ms.length === 1 ? "marker" : "markers"}</span>
            </div>
            <p className={styles.learn}>{category.learn}</p>
            <ul className={styles.markers}>
              {ms.map((m) => (
                <li key={m.id} className={styles.marker}>
                  {m.name}{m.derivedFrom ? <span className={styles.dot} title="Calculated from other results in the panel" aria-label="calculated" /> : null}
                </li>
              ))}
            </ul>
            <details className={styles.details}>
              <summary className={styles.summary}>
                <span>What each one measures</span>
                <span className={styles.toggle} aria-hidden="true"><Icon name="plus" size={16} className={styles.plus} /><Icon name="minus" size={16} className={styles.minus} /></span>
              </summary>
              <dl className={styles.defs}>
                {ms.map((m) => (
                  <div key={m.id} className={styles.def}>
                    <dt>{m.name}</dt>
                    <dd>{m.about}</dd>
                  </div>
                ))}
              </dl>
            </details>
          </li>
        ))}
      </ul>
      {hasDerived ? (
        <p className={styles.legend}><span className={styles.dot} aria-hidden="true" /> Calculated from other results in the same sample. No extra test, no extra cost.</p>
      ) : null}
    </div>
  );
}
