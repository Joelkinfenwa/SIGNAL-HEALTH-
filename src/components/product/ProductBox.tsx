import { SignalMark } from "@/components/brand/Logo";
import { Icon } from "@/components/ui/Icon";
import { Gauge } from "@/components/preview/ResultsPreview";
import { previewGauges } from "@/config/preview";
import { productCategoryCount, productMarkerCount, signalTest } from "@/config/products";
import { formatAUD } from "@/lib/money";
import { cx } from "@/lib/cx";
import styles from "./ProductBox.module.css";

/**
 * The SIGNAL Test as an object: a product card you could pick up, with what it
 * contains fanned out behind it (the pathology request form, the doctor's note,
 * the results page). Pure CSS, no images, so it never goes stale: counts and
 * price come from config/products.ts. Nothing here implies a posted kit.
 */
export function ProductBox({ className, areas: areasProp }: { className?: string; /** Areas as the page groups them; defaults to the catalogue count. */ areas?: number }) {
  const markers = productMarkerCount(signalTest), areas = areasProp ?? productCategoryCount(signalTest);
  const price = signalTest.priceCents !== null ? formatAUD(signalTest.priceCents) : "TBC";
  const g = previewGauges[0]!;
  return (
    <div className={cx(styles.scene, className)} aria-label={`The SIGNAL Test: ${markers} markers across ${areas} areas of health, ${price}`}>
      {/* Contents, behind the card */}
      <div className={cx(styles.sheet, styles.sheetForm)} aria-hidden="true">
        <span className={styles.sheetK}>Pathology request form</span>
        <span className={styles.sheetLine} /><span className={styles.sheetLine} style={{ width: "62%" }} /><span className={styles.sheetLine} style={{ width: "48%" }} />
        <span className={styles.sheetStamp}><Icon name="check" size={12} /> Emailed after you order</span>
      </div>
      <div className={cx(styles.sheet, styles.sheetNote)} aria-hidden="true">
        <span className={styles.sheetK}>Doctor&apos;s note</span>
        <span className={styles.sheetLine} /><span className={styles.sheetLine} style={{ width: "88%" }} /><span className={styles.sheetLine} style={{ width: "70%" }} /><span className={styles.sheetLine} style={{ width: "40%" }} />
      </div>
      <div className={cx(styles.sheet, styles.sheetResults)} aria-hidden="true">
        <span className={styles.sheetK}>Your results</span>
        <span className={styles.sheetRow}><b>{g.name}</b><span className="num">{g.value} <small>{g.unit}</small></span></span>
        <Gauge g={g} compact />
      </div>

      {/* The product card */}
      <div className={styles.card}>
        <div className={styles.cardTop}>
          <span><span className={styles.mark}><SignalMark className={styles.markSvg} /> SIGNAL</span><span className={styles.by}>by Express Pathology</span></span>
          <span className={cx(styles.price, "num")}>{price}</span>
        </div>
        <div className={styles.cardMid}>
          <span className={styles.big}><span className="num">{markers}</span></span>
          <span className={styles.bigLbl}>blood markers<br />across <span className="num">{areas}</span> areas of health</span>
        </div>
        <ul className={styles.cardList}>
          <li><Icon name="tube" size={14} /> One blood draw, walk in</li>
          <li><Icon name="shield" size={14} /> Reviewed by a doctor</li>
          <li><Icon name="chat" size={14} /> Every result explained</li>
        </ul>
        <div className={styles.cardFoot}><span className={styles.name}>The SIGNAL Test</span></div>
        <span className={styles.sheen} aria-hidden="true" />
      </div>
    </div>
  );
}
