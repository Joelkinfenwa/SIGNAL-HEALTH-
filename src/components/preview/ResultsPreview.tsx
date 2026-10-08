import { Icon } from "@/components/ui/Icon";
import { previewGauges, previewPerson, previewSummary, previewSystems, previewTrend, type GaugeExample } from "@/config/preview";
import { cx } from "@/lib/cx";
import styles from "./ResultsPreview.module.css";

/**
 * Illustrations of the SIGNAL results experience for marketing pages. They
 * reproduce the real portal's visuals (within-range ring, Low / Within range /
 * High gauge, trend over time, body-system grouping) with example data from
 * config/preview.ts. Every piece carries an "Example" label. Server components,
 * no JavaScript.
 */

const Example = ({ dark }: { dark?: boolean }) => <span className={cx(styles.example, dark && styles.exampleDark)}>{previewPerson.label}</span>;

/** The within-range ring from the portal hero. Proportions only. */
function Ring({ within, outside }: { within: number; outside: number }) {
  const r = 46, C = 2 * Math.PI * r, all = within + outside;
  const inLen = (C * within) / all, outLen = (C * outside) / all;
  const pct = Math.round((within / all) * 100);
  return (
    <svg className={styles.ring} viewBox="0 0 120 120" aria-hidden="true">
      <circle className={styles.ringTrack} cx="60" cy="60" r={r} />
      <circle className={styles.ringIn} cx="60" cy="60" r={r} strokeDasharray={`${Math.max(0, inLen - 2)} ${C}`} transform="rotate(-90 60 60)" />
      {outside ? <circle className={styles.ringOut} cx="60" cy="60" r={r} strokeDasharray={`${Math.max(0, outLen - 2)} ${C}`} strokeDashoffset={-inLen} transform="rotate(-90 60 60)" /> : null}
      <text className={styles.ringBig} x="60" y="58" textAnchor="middle" dominantBaseline="central">{pct}%</text>
      <text className={styles.ringLbl} x="60" y="80" textAnchor="middle">in range</text>
    </svg>
  );
}

/** Low / Within range / High bar with the result pinned where it sits. */
export function Gauge({ g, compact }: { g: GaugeExample; compact?: boolean }) {
  const low = g.bandLeft > 0.5, high = g.bandRight < 99.5;
  return (
    <div className={cx(styles.gauge, g.status === "out" ? styles.gaugeOut : styles.gaugeIn, compact && styles.gaugeCompact)} aria-label={`${g.name} ${g.value} ${g.unit}, laboratory range ${g.range}, ${g.status === "in" ? "within range" : "outside range"}`}>
      <div className={styles.words} aria-hidden="true">
        {low ? <span className={styles.wLo} style={{ left: 0, width: `${g.bandLeft}%` }}>Low</span> : null}
        <span className={styles.wOk} style={{ left: `${g.bandLeft}%`, width: `${g.bandRight - g.bandLeft}%` }}>Within range</span>
        {high ? <span className={styles.wHi} style={{ left: `${g.bandRight}%`, width: `${100 - g.bandRight}%` }}>High</span> : null}
      </div>
      <div className={styles.bar} aria-hidden="true">
        <div className={styles.zones}>
          {low ? <span className={styles.zLo} style={{ left: 0, width: `${g.bandLeft}%` }} /> : null}
          <span className={cx(styles.zOk, g.status === "in" && styles.hit)} style={{ left: `${g.bandLeft}%`, width: `${g.bandRight - g.bandLeft}%` }} />
          {high ? <span className={cx(styles.zHi, g.status === "out" && styles.hit)} style={{ left: `${g.bandRight}%`, width: `${100 - g.bandRight}%` }} /> : null}
        </div>
        <span className={styles.pin} style={{ left: `${g.pin}%` }} />
      </div>
    </div>
  );
}

/** A phone showing the portal's Home screen: the first thing a customer sees. */
export function PhonePreview({ className }: { className?: string }) {
  const s = previewSummary;
  const lead = previewGauges[0]!;
  return (
    <figure className={cx(styles.phone, className)} aria-label="Example of the SIGNAL results screen on a phone">
      <div className={styles.screen}>
        <p className={styles.greet}>Good morning, {previewPerson.firstName}.</p>
        <p className={styles.greetSub}>Your results are in. 1 marker is worth a look.</p>
        <div className={styles.heroCard}>
          <p className={styles.heroK}><Icon name="shield" size={12} /> Reviewed by your doctor</p>
          <p className={styles.heroH}>{s.markers} markers tested,<br />{s.within} within range.</p>
          <div className={styles.heroRow}>
            <Ring within={s.within} outside={s.outside} />
            <ul className={styles.legend}>
              <li><i className={styles.dotIn} /> <b className="num">{s.within}</b> within range</li>
              <li><i className={styles.dotOut} /> <b className="num">{s.outside}</b> outside range</li>
              <li className={styles.legendSub}>Collected {s.collected}</li>
            </ul>
          </div>
        </div>
        <div className={styles.tiles}>
          <div className={cx(styles.tile, styles.tileGood)}><b className="num">3</b><span>back within range</span></div>
          <div className={cx(styles.tile, styles.tileWatch)}><b className="num">1</b><span>outside range</span></div>
        </div>
        <div className={styles.look}>
          <p className={styles.lookK}>Worth a look</p>
          <div className={styles.lookHead}><span className={styles.lookName}>{lead.name}</span><span className={styles.lookVal}><b className="num">{lead.value}</b> {lead.unit}</span></div>
          <Gauge g={lead} compact />
          <p className={styles.lookSay}>Your result is <b>above</b> the laboratory range ({lead.range}).</p>
        </div>
      </div>
      <figcaption className={styles.phoneCap}><Example dark /></figcaption>
    </figure>
  );
}

/** Three markers on the gauge: "where every result sits". */
export function GaugePreview() {
  return (
    <div className={styles.card}>
      <ul className={styles.gaugeList}>
        {previewGauges.map((g) => (
          <li key={g.name} className={styles.gaugeRow}>
            <div className={styles.gaugeHead}>
              <span><span className={styles.gName}>{g.name}</span><span className={styles.gArea}>{g.area}</span></span>
              <span className={styles.gVal}><b className="num">{g.value}</b> <small>{g.unit}</small></span>
            </div>
            <Gauge g={g} />
            <p className={cx(styles.gSay, g.status === "out" && styles.gSayOut)}>{g.sentence}</p>
          </li>
        ))}
      </ul>
      <Example />
    </div>
  );
}

/** One marker across three tests with the laboratory band drawn in. */
export function TrendPreview() {
  const t = previewTrend;
  const W = 280, H = 110, L = 14, R = 14, T = 16, B = 26;
  const vals = t.points.map((p) => p.value);
  const ymin = Math.min(...vals) - 0.6, ymax = Math.max(...vals, t.rangeHigh) + 0.5;
  const x = (i: number) => L + ((W - L - R) * i) / (t.points.length - 1);
  const y = (v: number) => T + (H - T - B) * (1 - (v - ymin) / (ymax - ymin));
  const path = t.points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");
  const area = `${path} L${x(t.points.length - 1).toFixed(1)},${(H - B).toFixed(1)} L${x(0).toFixed(1)},${(H - B).toFixed(1)} Z`;
  return (
    <div className={styles.card}>
      <div className={styles.gaugeHead}>
        <span><span className={styles.gName}>{t.name}</span><span className={styles.gArea}>{t.area}</span></span>
        <span className={styles.gVal}><b className="num">{t.points[t.points.length - 1]!.value}</b> <small>{t.unit}</small></span>
      </div>
      <svg className={styles.spark} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${t.name} across three tests: ${t.points.map((p) => `${p.label} ${p.value}`).join(", ")}`}>
        <defs><linearGradient id="pv-grad" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="var(--c-sage)" stopOpacity=".22" /><stop offset="1" stopColor="var(--c-sage)" stopOpacity="0" /></linearGradient></defs>
        <rect x={L} y={y(t.rangeHigh)} width={W - L - R} height={Math.max(0, H - B - y(t.rangeHigh))} rx="4" className={styles.band} />
        <line x1={L} x2={W - R} y1={y(t.rangeHigh)} y2={y(t.rangeHigh)} className={styles.bandLine} />
        <text x={W - R} y={y(t.rangeHigh) - 5} textAnchor="end" className={styles.bandText}>range &lt;{t.rangeHigh}</text>
        <path d={area} fill="url(#pv-grad)" />
        <path d={path} className={styles.line} />
        {t.points.map((p, i) => (
          <g key={p.label}>
            <circle cx={x(i)} cy={y(p.value)} r={i === t.points.length - 1 ? 5.5 : 4} className={p.value > t.rangeHigh ? styles.ptOut : styles.ptIn} />
            <text x={x(i)} y={H - 8} textAnchor={i === 0 ? "start" : i === t.points.length - 1 ? "end" : "middle"} className={styles.axis}>{p.label}</text>
          </g>
        ))}
      </svg>
      <p className={styles.change}><Icon name="trendUp" size={14} className={styles.flip} /> {t.change}</p>
      <Example />
    </div>
  );
}

/** Every marker grouped by what it tells you about. */
export function SystemsPreview() {
  return (
    <div className={styles.card}>
      <ul className={styles.systems}>
        {previewSystems.map((s) => (
          <li key={s.name} className={cx(styles.system, s.outside > 0 && styles.systemAtt)}>
            <span className={styles.sysName}>{s.name}</span>
            <span className={styles.sysDots} aria-hidden="true">{Array.from({ length: s.count }, (_, i) => <i key={i} className={i < s.outside ? styles.sdOut : styles.sdIn} />)}</span>
            <span className={styles.sysCount}>{s.outside ? `${s.outside} outside range` : "All within range"}</span>
          </li>
        ))}
      </ul>
      <Example />
    </div>
  );
}
