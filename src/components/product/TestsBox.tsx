import { SignalMark } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { addonNewMarkers, sellableAddonsFor } from "@/config/addons";
import { getBiomarker } from "@/config/biomarkers";
import { productMarkerCount, signalTest } from "@/config/products";
import { formatAUD } from "@/lib/money";
import { cx } from "@/lib/cx";
import styles from "./TestsBox.module.css";

/**
 * Every test on sale today, as cards: the SIGNAL Test, then each sellable
 * add-on with its price and every marker it adds. Driven entirely by
 * config/products.ts and config/addons.ts, so withdrawing or pricing an
 * add-on changes this box without touching it.
 */
export interface TestArea { id: string; name: string; explanation: string; markerIds: string[] }

export function TestsBox({ areas, location = "men_tests" }: { areas: TestArea[]; location?: string }) {
  const price = signalTest.priceCents !== null ? formatAUD(signalTest.priceCents) : "TBC";
  const addons = sellableAddonsFor(signalTest);
  return (
    <div className={styles.box}>
      <article className={styles.base} aria-labelledby="test-signal">
        <div className={styles.baseHead}>
          <span className={styles.mark}><SignalMark className={styles.markSvg} /> SIGNAL</span>
          <span className={styles.baseTag}>The base test</span>
        </div>
        <h3 id="test-signal" className={styles.baseTitle}>{signalTest.name}</h3>
        <p className={styles.baseBody}><span className="num">{productMarkerCount(signalTest)}</span> markers across <span className="num">{areas.length}</span> areas of health, one blood draw, a doctor&apos;s written explanation of every result. Here is every one of them.</p>
        <ul className={styles.areas} aria-label="What the SIGNAL Test measures">
          {areas.map((b) => (
            <li key={b.id} className={styles.area}>
              <span className={styles.areaHead}><span className={styles.areaName}>{b.name}</span><span className={styles.areaCount}><span className="num">{b.markerIds.length}</span> {b.markerIds.length === 1 ? "marker" : "markers"}</span></span>
              <span className={styles.areaWhy}>{b.explanation}</span>
              <ul className={styles.areaChips}>{b.markerIds.map((id) => <li key={id}>{getBiomarker(id).name}</li>)}</ul>
            </li>
          ))}
        </ul>
        <ul className={styles.baseList}>
          <li><Icon name="tube" size={14} /> Walk in to any 4Cyte or Clinical Labs centre</li>
          <li><Icon name="shield" size={14} /> Reviewed by an Australian-registered doctor</li>
          <li><Icon name="chat" size={14} /> Every result explained in plain English</li>
        </ul>
        <div className={styles.baseFoot}>
          <span className={cx(styles.basePrice, "num")}>{price}</span>
          <Button href="/checkout" ctaId={`${location}_signal`} location={location} className={styles.baseBtn}>Get tested <Icon name="arrow" size={16} /></Button>
        </div>
      </article>

      <div className={styles.addons}>
        <p className={styles.addonsK}>Add-ons · same draw, added at checkout</p>
        <ul className={styles.grid}>
          {addons.map((a) => {
            const markers = addonNewMarkers(a, signalTest).map((id) => getBiomarker(id).name);
            return (
              <li key={a.id} className={styles.card}>
                <div className={styles.cardHead}>
                  <span className={styles.cardName}>{a.name}</span>
                  <span className={cx(styles.cardPrice, "num")}>{a.priceCents !== null ? `+${formatAUD(a.priceCents)}` : "TBC"}</span>
                </div>
                <p className={styles.cardBody}>{a.shortDescription}</p>
                <p className={styles.cardFor}>For you if {a.forWho.charAt(0).toLowerCase()}{a.forWho.slice(1)}</p>
                <ul className={styles.chips} aria-label={`Markers in ${a.name}`}>{markers.map((m) => <li key={m}>{m}</li>)}</ul>
                <span className={styles.cardCount}><span className="num">{markers.length}</span> marker{markers.length === 1 ? "" : "s"} added</span>
                <Button href={`/checkout?addons=${a.id}`} variant="outline" size="sm" ctaId={`${location}_${a.id}`} location={location} className={styles.cardBtn}>Add to my test</Button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
