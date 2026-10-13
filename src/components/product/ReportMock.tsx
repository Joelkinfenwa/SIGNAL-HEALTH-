import { Icon } from "@/components/ui/Icon";
import { getBiomarker } from "@/config/biomarkers";
import { signalTest } from "@/config/products";
import { cx } from "@/lib/cx";
import styles from "./ReportMock.module.css";

/**
 * What a customer receives, drawn as documents: a copy of the laboratory
 * report and the doctor's written explanation. Layout only. Marker names come
 * from the real panel; results, ranges and the doctor's words are blank bars,
 * never invented values. Both carry an "illustration" label.
 */
const Label = () => <span className={styles.label}>Illustration of the layout, not a real report</span>;

export function LabReportMock({ className }: { className?: string }) {
  const rows = signalTest.markerIds.slice(0, 9).map((id) => getBiomarker(id).name);
  return (
    <figure className={cx(styles.doc, className)} aria-label="Illustration: a laboratory report with a row per marker showing the result, the reference range and any flag">
      <div className={styles.docHead}>
        <span className={styles.docK}>Laboratory report</span>
        <span className={styles.docSub}>Copy for the patient</span>
      </div>
      <div className={styles.cols} aria-hidden="true"><span>Marker</span><span>Result</span><span>Reference range</span><span>Flag</span></div>
      <ul className={styles.rows} aria-hidden="true">
        {rows.map((name, i) => (
          <li key={name} className={styles.row}>
            <span className={styles.name}>{name}</span>
            <span className={styles.bar} style={{ width: `${46 + (i * 17) % 40}%` }} />
            <span className={styles.bar} style={{ width: `${60 + (i * 23) % 35}%` }} />
            <span className={styles.flagCell}>{i === 3 ? <span className={styles.flag}>H</span> : null}</span>
          </li>
        ))}
        <li className={styles.more}>…and every other marker on the panel</li>
      </ul>
      <figcaption><Label /></figcaption>
    </figure>
  );
}

export function DoctorNoteMock({ className }: { className?: string }) {
  return (
    <figure className={cx(styles.doc, styles.note, className)} aria-label="Illustration: the doctor's written explanation, a page of plain-English text">
      <div className={styles.docHead}>
        <span className={styles.docK}>Doctor&apos;s written explanation</span>
        <span className={styles.docSub}><Icon name="shield" size={12} /> Australian-registered doctor</span>
      </div>
      <div className={styles.para} aria-hidden="true">
        <span className={styles.h} style={{ width: "48%" }} />
        <span className={styles.line} /><span className={styles.line} style={{ width: "94%" }} /><span className={styles.line} style={{ width: "72%" }} />
        <span className={styles.h} style={{ width: "40%" }} />
        <span className={styles.line} /><span className={styles.line} style={{ width: "88%" }} /><span className={styles.line} style={{ width: "96%" }} /><span className={styles.line} style={{ width: "55%" }} />
        <span className={styles.h} style={{ width: "56%" }} />
        <span className={styles.line} style={{ width: "90%" }} /><span className={styles.line} style={{ width: "64%" }} />
      </div>
      <figcaption><Label /></figcaption>
    </figure>
  );
}
