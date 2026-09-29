import { Icon } from "@/components/ui/Icon";
import { Section, SectionHeader } from "@/components/ui/Section";
import { comparisonColumns, comparisonRows } from "@/config/comparison";
import { fillHomeTokens } from "@/lib/home-tokens";
import styles from "./Comparison.module.css";

/** SIGNAL vs a standard check-up. Real <table>; rows come from config and are TODO-VERIFY until signed off. */
export function Comparison() {
  return (
    <Section id="compare" theme="shell" labelledBy="compare-title">
      <SectionHeader
        id="compare-title"
        eyebrow="Why SIGNAL"
        align="center"
        title="More than a standard check-up."
        intro="A standard check-up is a good thing. SIGNAL is built for people who want to look wider and track change over time."
      />
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <caption className="visually-hidden">How SIGNAL compares with a standard check-up</caption>
          <thead>
            <tr>
              <th scope="col" className={styles.rowHead}><span className="visually-hidden">Feature</span></th>
              <th scope="col" className={styles.signalHead}>{comparisonColumns.signal}</th>
              <th scope="col" className={styles.standardHead}>{comparisonColumns.standard}</th>
            </tr>
          </thead>
          <tbody>
            {comparisonRows.map((r) => (
              <tr key={r.id}>
                <th scope="row" className={styles.rowHead}>{r.label}</th>
                <td className={styles.signalCell}>
                  <span className={styles.tick}><Icon name="check" size={14} /></span>
                  <span>{fillHomeTokens(r.signal)}</span>
                </td>
                <td className={styles.standardCell}>{fillHomeTokens(r.standard)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}
