import { Icon } from "@/components/ui/Icon";
import { resultsMock, type Step } from "@/config/home";
import { media } from "@/config/media";
import { featuredProduct, products } from "@/config/products";
import { activeRetestOffer } from "@/config/retest-offer";
import { cx } from "@/lib/cx";
import { Photo } from "./Photo";
import styles from "./StepMock.module.css";

/**
 * Small illustrative UI mocks for the How-it-works steps. Server-rendered,
 * decorative (aria-hidden) — the step text carries the meaning.
 * No real values, ranges or outcomes.
 */
export function StepMock({ step }: { step: Step["id"] }) {
  switch (step) {
    case "choose":
      return <ChooseMock />;
    case "collect":
      return <Photo asset={media.homeVisit} sizes="(min-width: 64rem) 25vw, 100vw" className={styles.photo} position="center 40%" />;
    case "understand":
      return <UnderstandMock />;
    case "retest":
      return <RetestMock />;
  }
}

function ChooseMock() {
  const featured = featuredProduct();
  return (
    <div className={styles.frame} aria-hidden="true">
      <ul className={styles.picker}>
        {products.map((p) => (
          <li key={p.id} className={cx(styles.option, p.id === featured.id && styles.selected)}>
            <span className={styles.radio} />
            <span className={styles.optionName}>{p.shortName}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function UnderstandMock() {
  return (
    <div className={styles.frame} aria-hidden="true">
      <div className={styles.readout}>
        <span className={styles.readoutLabel}>{resultsMock.marker}</span>
        <span className={styles.readoutValue}>
          <span className="num">{resultsMock.value}</span> <small>{resultsMock.unit}</small>
        </span>
        <span className={styles.range}><span className={styles.rangeFill} /><span className={styles.rangeDot} /></span>
        <span className={styles.readoutStatus}><Icon name="check" size={14} /> {resultsMock.status}</span>
      </div>
    </div>
  );
}

function RetestMock() {
  const months = activeRetestOffer()?.intervalMonths ?? 6;
  const points = [0.25, 0.5, 0.78];
  const W = 100;
  const H = 40;
  const xs = [6, W / 2, W - 6];
  const y = (v: number) => H - 6 - v * (H - 12);
  return (
    <div className={styles.frame} aria-hidden="true">
      <div className={styles.trend}>
        <span className={styles.trendHead}>
          <span className={styles.readoutLabel}>Ferritin</span>
          <span className={styles.up}><Icon name="trendUp" size={14} /> Improving</span>
        </span>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className={styles.spark}>
          <polyline points={points.map((v, i) => `${xs[i]},${y(v)}`).join(" ")} />
          {points.map((v, i) => (
            <circle key={i} cx={xs[i]} cy={y(v)} r={i === 2 ? 3.2 : 2.2} className={i === 2 ? styles.latest : undefined} />
          ))}
        </svg>
        <span className={styles.trendFoot}>
          <span>Today</span><span>{months} mo</span><span>{months * 2} mo</span>
        </span>
      </div>
    </div>
  );
}
